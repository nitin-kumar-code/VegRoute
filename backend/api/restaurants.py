from fastapi import APIRouter
from services.db import db_service
import psycopg2.extras

router = APIRouter()

@router.get("/")
def get_all_restaurants():
    """
    Fetches all restaurants for the frontend explore and map views.
    """
    with db_service._get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT r.restaurant_id as id, r.name, r.address, r.lat, r.lng, 
                       r.pure_veg, r.jain_available, r.south_indian, r.north_indian, 
                       r.bengali_tripuri, r.rating, r.price_range as price,
                       r.nearest_node_id, r.snap_distance_m,
                       s.trust_score, s.rating_count
                FROM restaurants r
                LEFT JOIN restaurant_stats s ON r.restaurant_id = s.restaurant_id
            """)
            return cur.fetchall()
