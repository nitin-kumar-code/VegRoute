import psycopg2

passwords = ["postgres", "password", "root", "admin", "nitinkumar", ""]

for pw in passwords:
    try:
        conn = psycopg2.connect(dbname="postgres", user="postgres", password=pw, host="localhost")
        print(f"SUCCESS with password: '{pw}'")
        break
    except Exception as e:
        pass
else:
    print("All failed for postgres user.")

for pw in passwords:
    try:
        conn = psycopg2.connect(dbname="postgres", user="nitinkumar", password=pw, host="localhost")
        print(f"SUCCESS with nitinkumar password: '{pw}'")
        break
    except Exception as e:
        pass
else:
    print("All failed for nitinkumar user.")
