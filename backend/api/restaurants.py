from fastapi import APIRouter
from services.db import db_service
from services.routing_service import routing_service
import psycopg2.extras
import math

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/")
def get_all_restaurants():
    """
    Fetches all restaurants and calculates their actual road network distance from NIT Agartala.
    """
    nit_agartala_node = "9684592943"
    
    with db_service._get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT r.restaurant_id as id, r.name, r.address, r.lat, r.lng, 
                       r.pure_veg, r.jain_available, r.south_indian, r.north_indian, 
                       r.bengali_tripuri, r.rating, r.price_range as price,
                       r.nearest_node_id, r.snap_distance_m,
                       s.trust_score, r.review_count as rating_count,
                       r.opening_hours, r.phone, r.locality, r.other_cuisines
                FROM restaurants r
                LEFT JOIN restaurant_stats s ON r.restaurant_id = s.restaurant_id
            """)
            restaurants = cur.fetchall()
            
            # Calculate shortest path distance for each restaurant
            for r in restaurants:
                try:
                    target = str(r["nearest_node_id"])
                    result = routing_service.get_shortest_path(nit_agartala_node, target)
                    
                    if result is not None and "error" not in result:
                        r["distance_m"] = result.get("total_time_s", 0) * 10 
                        
                        dist = 0
                        route = result.get("route", [])
                        for i in range(len(route)-1):
                            dist += haversine(route[i]["lat"], route[i]["lng"], route[i+1]["lat"], route[i+1]["lng"])
                        r["distance"] = f"{(dist/1000):.1f} km"
                        r["distance_value"] = dist
                    else:
                        r["distance"] = "Unknown"
                        r["distance_value"] = 999999
                except Exception as e:
                    r["distance"] = "Unknown"
                    r["distance_value"] = 999999
                    print(f"Error routing to {r['name']}: {e}")
            
            return restaurants
