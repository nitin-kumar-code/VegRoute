import psycopg2
try:
    conn = psycopg2.connect(dbname="postgres")
    print("SUCCESS with socket as default user!")
except Exception as e:
    print(f"Failed socket: {e}")

try:
    conn = psycopg2.connect(dbname="postgres", user="postgres")
    print("SUCCESS with socket as postgres user!")
except Exception as e:
    print(f"Failed socket postgres: {e}")
