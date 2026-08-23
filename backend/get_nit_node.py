import psycopg2
import math

conn = psycopg2.connect("postgresql://vegroute_user:vegroute_pass@localhost:5432/vegroute")
cur = conn.cursor()

lat, lng = 23.840, 91.421
cur.execute("""
    SELECT node_id, 
    (6371000 * acos(
        cos(radians(lat)) * cos(radians(%s)) * cos(radians(%s) - radians(lng)) + 
        sin(radians(lat)) * sin(radians(%s))
    )) as dist
    FROM intersections
    ORDER BY dist ASC LIMIT 1;
""", (lat, lng, lat))
print(cur.fetchone())
