import psycopg2
from psycopg2.extras import RealDictCursor
from core.config import settings

class DatabaseService:
    def __init__(self):
        self.conn_str = settings.DATABASE_URL
        
    def _get_connection(self):
        """Creates and returns a new DB connection."""
        conn = psycopg2.connect(self.conn_str)
        conn.autocommit = True
        return conn

    # ==========================================
    # INTERSECTIONS (NODES)
    # ==========================================

    def create_intersection(self, node_id: str, lat: float, lng: float, type: str):
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO intersections (node_id, lat, lng, geom, type) 
                    VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s)
                    RETURNING node_id
                """, (node_id, lat, lng, lng, lat, type)) # ST_MakePoint takes (lng, lat)
                return cur.fetchone()

    def get_intersection(self, node_id: str):
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT node_id, lat, lng, type, ST_AsGeoJSON(geom) as geometry 
                    FROM intersections 
                    WHERE node_id = %s
                """, (node_id,))
                return cur.fetchone()

    def get_all_intersections(self):
        """Fetches all intersections to load spatial data into the Graph Engine."""
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT node_id, lat, lng FROM intersections")
                    return cur.fetchall()
        except Exception as e:
            print(f"Failed to load intersections from DB. Error: {e}")
            return []

    # ==========================================
    # ROADS (EDGES / GRAPH DATA)
    # ==========================================

    def create_road(self, edge_id, from_node, to_node, distance_m, travel_time, road_class, is_one_way, name, wkt_geom):
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO roads (edge_id, from_node_id, to_node_id, distance_m, avg_travel_time_s, road_class, is_one_way, name, geom) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326))
                    RETURNING edge_id
                """, (edge_id, from_node, to_node, distance_m, travel_time, road_class, is_one_way, name, wkt_geom))
                return cur.fetchone()

    def get_all_edges(self):
        """
        Fetches all road segments to build the Graph Engine in memory.
        This pulls the raw routing topology into the Python backend.
        """
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT from_node_id, to_node_id, distance_m, avg_travel_time_s, road_class, is_one_way
                        FROM roads
                    """)
                    return cur.fetchall()
        except Exception as e:
            print(f"Failed to load edges from DB. Fallback to mock data. Error: {e}")
            return []

    # ==========================================
    # RESTAURANTS
    # ==========================================

    def create_restaurant(self, rest_id, name, nearest_node, snap_dist, purity, lng, lat):
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO restaurants (restaurant_id, name, nearest_node_id, snap_distance_m, purity_level, geom) 
                    VALUES (%s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    RETURNING restaurant_id
                """, (rest_id, name, nearest_node, snap_dist, purity, lng, lat))
                return cur.fetchone()

    def get_restaurant(self, restaurant_id: str):
        """
        Reads a restaurant AND its dynamic trust score from the View.
        """
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT r.restaurant_id, r.name, r.purity_level, ST_AsGeoJSON(r.geom) as geometry, 
                           s.trust_score, s.rating_avg, s.rating_count
                    FROM restaurants r
                    LEFT JOIN restaurant_stats s ON r.restaurant_id = s.restaurant_id
                    WHERE r.restaurant_id = %s
                """, (restaurant_id,))
                return cur.fetchone()

    def refresh_restaurant_stats(self):
        """
        Refreshes the materialized view 'restaurant_stats' to update trust scores and ratings.
        This can be scheduled via a background job or triggered by an admin endpoint.
        """
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    # CONCURRENTLY allows the view to be read while it is refreshing
                    cur.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY restaurant_stats;")
            return True
        except Exception as e:
            print(f"Failed to refresh materialized view: {e}")
            return False

    # ==========================================
    # SPATIAL QUERIES
    # ==========================================

    def find_restaurants_within_radius(self, lat: float, lng: float, radius_meters: float):
        """
        Finds all restaurants within a physical real-world radius.
        Uses ::geography casting to ensure distance is measured spherically in meters, 
        not linearly in planar degrees.
        """
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT r.restaurant_id, r.name, r.purity_level, ST_AsGeoJSON(r.geom) as geometry, 
                           s.trust_score, s.rating_avg
                    FROM restaurants r
                    LEFT JOIN restaurant_stats s ON r.restaurant_id = s.restaurant_id
                    WHERE ST_DWithin(
                        r.geom::geography, 
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography, 
                        %s
                    )
                """, (lng, lat, radius_meters)) # ST_MakePoint is always (lng, lat)
                return cur.fetchall()

    def verify_snap_distances(self, restaurant_ids: list):
        """
        Batched query to check the exact distance between multiple restaurants and their snapped nearest nodes.
        Used to audit data quality and flag missing roads.
        """
        if not restaurant_ids:
            return []
            
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # We use an ANY clause to batch this into a single DB call
                cur.execute("""
                    SELECT 
                        r.restaurant_id,
                        r.nearest_node_id,
                        ST_Distance(
                            r.geom::geography,
                            i.geom::geography
                        ) as calculated_distance_m
                    FROM restaurants r
                    JOIN intersections i ON r.nearest_node_id = i.node_id
                    WHERE r.restaurant_id = ANY(%s)
                """, (restaurant_ids,))
                return cur.fetchall()

db_service = DatabaseService()
