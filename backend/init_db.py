import psycopg2
from core.config import settings

def init_db():
    print(f"Connecting to database to initialize schema: {settings.DATABASE_URL}")
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Enabling PostGIS extension...")
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        
        print("Dropping existing tables if they exist (for clean rebuild)...")
        # Drop materialized view first because it depends on tables
        cur.execute("DROP MATERIALIZED VIEW IF EXISTS restaurant_stats;")
        cur.execute("DROP TABLE IF EXISTS reviews CASCADE;")
        cur.execute("DROP TABLE IF EXISTS restaurants CASCADE;")
        cur.execute("DROP TABLE IF EXISTS roads CASCADE;")
        cur.execute("DROP TABLE IF EXISTS intersections CASCADE;")
        
        print("Creating 'intersections' table...")
        cur.execute("""
            CREATE TABLE intersections (
                node_id VARCHAR(255) PRIMARY KEY,
                lat FLOAT NOT NULL,
                lng FLOAT NOT NULL,
                geom GEOMETRY(Point, 4326),
                type VARCHAR(50)
            );
            CREATE INDEX idx_intersections_geom ON intersections USING GIST (geom);
        """)
        
        print("Creating 'roads' table...")
        cur.execute("""
            CREATE TABLE roads (
                edge_id VARCHAR(255) PRIMARY KEY,
                from_node_id VARCHAR(255) REFERENCES intersections(node_id) ON DELETE RESTRICT,
                to_node_id VARCHAR(255) REFERENCES intersections(node_id) ON DELETE RESTRICT,
                distance_m FLOAT NOT NULL,
                avg_travel_time_s FLOAT NOT NULL,
                road_class VARCHAR(50),
                is_one_way BOOLEAN DEFAULT FALSE,
                name VARCHAR(255),
                geom GEOMETRY(LineString, 4326)
            );
            CREATE INDEX idx_roads_geom ON roads USING GIST (geom);
            CREATE INDEX idx_roads_from_node ON roads(from_node_id);
        """)
        
        print("Creating 'restaurants' table...")
        cur.execute("""
            CREATE TABLE restaurants (
                restaurant_id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                nearest_node_id VARCHAR(255) REFERENCES intersections(node_id),
                snap_distance_m FLOAT,
                purity_level VARCHAR(50),
                opening_hours JSONB,
                data_source VARCHAR(50),
                geom GEOMETRY(Point, 4326)
            );
            CREATE INDEX idx_restaurants_geom ON restaurants USING GIST (geom);
            CREATE INDEX idx_restaurants_purity ON restaurants(purity_level);
        """)
        
        print("Creating 'reviews' table...")
        cur.execute("""
            CREATE TABLE reviews (
                review_id VARCHAR(255) PRIMARY KEY,
                restaurant_id VARCHAR(255) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
                device_id VARCHAR(255) NOT NULL,
                confirms_purity BOOLEAN NOT NULL,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5)
            );
            CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
        """)
        
        print("Creating 'restaurant_stats' Materialized View...")
        cur.execute("""
            CREATE MATERIALIZED VIEW restaurant_stats AS
            SELECT 
                r.restaurant_id,
                COUNT(DISTINCT v.device_id) FILTER (WHERE v.confirms_purity = true) AS trust_score,
                ROUND(AVG(v.rating), 1) AS rating_avg,
                COUNT(v.review_id) AS rating_count
            FROM restaurants r
            LEFT JOIN reviews v ON r.restaurant_id = v.restaurant_id
            GROUP BY r.restaurant_id;
            
            CREATE UNIQUE INDEX idx_restaurant_stats_id ON restaurant_stats(restaurant_id);
        """)
        
        print("Database schema initialization complete!")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
