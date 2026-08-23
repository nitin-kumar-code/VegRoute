import os
import sys
import csv
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
import math
from scipy.spatial import KDTree

# Add backend dir to path for config
sys.path.append(str(Path(__file__).resolve().parent))
from core.config import settings

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def import_data():
    scratch_dir = "/Users/nitinkumar/.gemini/antigravity/brain/1bbbea09-76e8-4edc-ab44-c39d05f019ac/scratch"
    
    print("Connecting to database...")
    conn = psycopg2.connect(settings.DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. Import Intersections
    print("Importing intersections...")
    intersections = []
    nodes_for_tree = []
    node_ids = []
    
    with open(f"{scratch_dir}/intersections.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            intersections.append((
                row['node_id'], 
                float(row['lat']), 
                float(row['lng'])
            ))
            # KDTree uses (lat, lng) but Euclidean distance on lat/lng is an approximation.
            # Good enough for snapping to the *nearest* node within a city.
            nodes_for_tree.append([float(row['lat']), float(row['lng'])])
            node_ids.append(row['node_id'])
            
    execute_values(cur, """
        INSERT INTO intersections (node_id, lat, lng)
        VALUES %s
        ON CONFLICT (node_id) DO NOTHING
    """, intersections, page_size=5000)
    print(f"Inserted {len(intersections)} intersections.")
    
    print("Building KDTree for fast spatial snapping...")
    tree = KDTree(nodes_for_tree)
    
    # 2. Import Roads
    print("Importing roads...")
    roads = []
    with open(f"{scratch_dir}/roads.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            roads.append((
                row['edge_id'],
                row['from_node_id'],
                row['to_node_id'],
                float(row['distance_m']),
                float(row['avg_travel_time_s']),
                row['road_class'],
                row['is_one_way'] == 'True',
                row['name']
            ))
            
    execute_values(cur, """
        INSERT INTO roads (edge_id, from_node_id, to_node_id, distance_m, avg_travel_time_s, road_class, is_one_way, name)
        VALUES %s
        ON CONFLICT (edge_id) DO NOTHING
    """, roads, page_size=5000)
    print(f"Inserted {len(roads)} roads.")
    
    # 3. Import Restaurants
    print("Importing restaurants...")
    rests = []
    with open(f"{scratch_dir}/restaurants.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat, lng = None, None
            if row['lat'] and row['lng']:
                lat, lng = float(row['lat']), float(row['lng'])
                
            # Snap to nearest node using KDTree
            nearest_node_id = None
            snap_dist = None
            if lat is not None and lng is not None:
                # KDTree query returns distance (euclidean in degrees) and index
                # We use the index to get the node ID, then calculate exact Haversine distance
                _, idx = tree.query([lat, lng])
                nearest_node_id = node_ids[idx]
                node_lat, node_lng = nodes_for_tree[idx]
                snap_dist = haversine(lat, lng, node_lat, node_lng)
            
            rests.append((
                row['id'], row['name'], row['address'], row['locality'],
                lat, lng,
                row['restaurant_type'], row['pure_veg'] == 'true', row['veg_friendly'] == 'true',
                row['jain_available'] == 'true', row['jain_friendly'] == 'true',
                row['south_indian'] == 'true', row['north_indian'] == 'true',
                row['bengali_tripuri'] == 'true', row['other_cuisines'],
                float(row['rating']), int(row['review_count']), row['price_range'],
                row['opening_hours'], row['phone'], row['website'], row['delivery_links'],
                row['image_url'], row['source'], row['verification_info'],
                nearest_node_id, snap_dist
            ))
            
    execute_values(cur, """
        INSERT INTO restaurants (
            restaurant_id, name, address, locality, lat, lng,
            restaurant_type, pure_veg, veg_friendly, jain_available, jain_friendly,
            south_indian, north_indian, bengali_tripuri, other_cuisines,
            rating, review_count, price_range, opening_hours, phone,
            website, delivery_links, image_url, source, verification_info,
            nearest_node_id, snap_distance_m
        ) VALUES %s
        ON CONFLICT (restaurant_id) DO NOTHING
    """, rests)
    print(f"Inserted {len(rests)} restaurants.")
    
    cur.close()
    conn.close()
    print("Import complete.")

if __name__ == "__main__":
    import_data()
