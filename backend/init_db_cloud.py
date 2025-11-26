import os
import sys

# Add the parent directory to sys.path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db

if __name__ == "__main__":
    print(f"Initializing database at {os.getenv('DATABASE_URL').split('@')[1] if '@' in os.getenv('DATABASE_URL', '') else 'LOCAL'}...")
    try:
        # The __init__ of Database calls _ensure_db which creates tables
        # We just need to instantiate it (already done by import) or force a check
        db._ensure_db()
        print("Database initialized successfully!")
        
        # Verify tables
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cursor.fetchall()
        print("Tables created:", [t['table_name'] for t in tables] if isinstance(tables[0], dict) else tables)
        conn.close()
        
    except Exception as e:
        print(f"Error initializing database: {e}")
