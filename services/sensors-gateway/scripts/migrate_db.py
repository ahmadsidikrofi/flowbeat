import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "omron.db")

def add_column():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE spo2_measurements ADD COLUMN blood_sugar FLOAT;")
        print("Kolom blood_sugar berhasil ditambahkan ke database!")
    except sqlite3.OperationalError as e:
        print(f"Info: {e} (Mungkin kolom sudah ada)")
    finally:
        conn.commit()
        conn.close()

if __name__ == '__main__':
    add_column()
