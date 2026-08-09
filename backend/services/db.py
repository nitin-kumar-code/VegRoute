import psycopg2
from psycopg2.extras import RealDictCursor
from core.config import settings

class DatabaseService:
    def __init__(self):
        self.conn = None
        
    def connect(self):
        try:
            self.conn = psycopg2.connect(settings.DATABASE_URL)
            print("Successfully connected to PostgreSQL")
        except Exception as e:
            print(f"Warning: Could not connect to DB. Using mock data for now. Error: {e}")
            self.conn = None

    def get_all_edges(self):
        """
        Fetches all road segments to build the Graph Engine.
        Returns mocked data if the database is not live yet.
        """
        if not self.conn:
            return [
                {"from_node_id": "N_001", "to_node_id": "N_002", "distance_m": 150.5, "avg_travel_time_s": 12.0, "road_class": "arterial", "is_one_way": False},
                {"from_node_id": "N_002", "to_node_id": "N_003", "distance_m": 42.1, "avg_travel_time_s": 5.0, "road_class": "local", "is_one_way": True}
            ]
            
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Query mirrors the database_schema.md structure
            cur.execute("""
                SELECT from_node_id, to_node_id, distance_m, avg_travel_time_s, road_class, is_one_way
                FROM roads
            """)
            return cur.fetchall()

db_service = DatabaseService()
