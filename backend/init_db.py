import psycopg2
from core.config import settings

def init_db():
    print(f"Connecting to database to initialize schema: {settings.DATABASE_URL}")
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        # 1. Reset Tables
        print("Dropping existing tables if they exist (for clean rebuild)...")
        cur.execute("DROP MATERIALIZED VIEW IF EXISTS restaurant_stats;")
        cur.execute("DROP TABLE IF EXISTS reviews CASCADE;")
        cur.execute("DROP TABLE IF EXISTS restaurants CASCADE;")
        cur.execute("DROP TABLE IF EXISTS roads CASCADE;")
        cur.execute("DROP TABLE IF EXISTS intersections CASCADE;")
        
        print("Creating 'intersections' table...")
        cur.execute("""
            CREATE TABLE intersections (
                node_id VARCHAR(50) PRIMARY KEY,
                lat DOUBLE PRECISION NOT NULL,
                lng DOUBLE PRECISION NOT NULL,
                type VARCHAR(50)
            );
            CREATE INDEX idx_intersections_lat_lng ON intersections(lat, lng);
        """)

        print("Creating 'roads' table (edges)...")
        cur.execute("""
            CREATE TABLE roads (
                edge_id VARCHAR(100) PRIMARY KEY,
                from_node_id VARCHAR(50) REFERENCES intersections(node_id) ON DELETE CASCADE,
                to_node_id VARCHAR(50) REFERENCES intersections(node_id) ON DELETE CASCADE,
                distance_m DOUBLE PRECISION NOT NULL,
                avg_travel_time_s DOUBLE PRECISION NOT NULL,
                road_class VARCHAR(50),
                is_one_way BOOLEAN DEFAULT FALSE,
                name VARCHAR(255)
            );
            CREATE INDEX idx_roads_from_node ON roads(from_node_id);
            CREATE INDEX idx_roads_to_node ON roads(to_node_id);
        """)

        print("Creating 'restaurants' table with extended attributes...")
        cur.execute("""
            CREATE TABLE restaurants (
                restaurant_id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                locality VARCHAR(100),
                lat DOUBLE PRECISION,
                lng DOUBLE PRECISION,
                
                restaurant_type VARCHAR(50),
                pure_veg BOOLEAN DEFAULT FALSE,
                veg_friendly BOOLEAN DEFAULT FALSE,
                jain_available BOOLEAN DEFAULT FALSE,
                jain_friendly BOOLEAN DEFAULT FALSE,
                south_indian BOOLEAN DEFAULT FALSE,
                north_indian BOOLEAN DEFAULT FALSE,
                bengali_tripuri BOOLEAN DEFAULT FALSE,
                other_cuisines TEXT,
                
                rating DOUBLE PRECISION,
                review_count INTEGER DEFAULT 0,
                price_range VARCHAR(20),
                opening_hours TEXT,
                phone VARCHAR(50),
                website TEXT,
                delivery_links TEXT,
                image_url TEXT,
                source VARCHAR(50),
                verification_info TEXT,
                
                nearest_node_id VARCHAR(50) REFERENCES intersections(node_id) ON DELETE SET NULL,
                snap_distance_m DOUBLE PRECISION
            );
            CREATE INDEX idx_restaurants_lat_lng ON restaurants(lat, lng);
            CREATE INDEX idx_restaurants_purity ON restaurants(pure_veg, jain_available);
        """)

        print("Creating 'reviews' table...")
        cur.execute("""
            CREATE TABLE reviews (
                review_id SERIAL PRIMARY KEY,
                restaurant_id VARCHAR(50) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
                user_id VARCHAR(50),
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                is_verified_veg BOOLEAN DEFAULT FALSE,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
        """)

        print("Creating Materialized View 'restaurant_stats'...")
        cur.execute("""
            CREATE MATERIALIZED VIEW restaurant_stats AS
            SELECT 
                r.restaurant_id,
                COUNT(rev.review_id) as rating_count,
                ROUND(AVG(rev.rating), 1) as rating_avg,
                (
                    SUM(CASE WHEN rev.is_verified_veg THEN 1 ELSE 0 END) * 10 
                    + COUNT(rev.review_id) * 2 
                    + (CASE WHEN r.pure_veg THEN 50 ELSE 0 END)
                ) as trust_score
            FROM restaurants r
            LEFT JOIN reviews rev ON r.restaurant_id = rev.restaurant_id
            GROUP BY r.restaurant_id, r.pure_veg;
            
            CREATE UNIQUE INDEX idx_mv_rest_id ON restaurant_stats(restaurant_id);
        """)
        
        cur.close()
        conn.close()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
