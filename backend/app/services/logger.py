import sqlite3
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import os

DB_FILE = "data/logs.db"

class LoggerService:
    def __init__(self):
        self._ensure_db()

    def _ensure_db(self):
        if not os.path.exists("data"):
            os.makedirs("data")
            
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                level TEXT,
                category TEXT,
                message TEXT,
                metadata TEXT
            )
        """)
        conn.commit()
        conn.close()

    def log(self, level: str, category: str, message: str, metadata: Dict[str, Any] = None):
        """Logs an event to the database."""
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO logs (timestamp, level, category, message, metadata) VALUES (?, ?, ?, ?, ?)",
                (
                    datetime.now().isoformat(),
                    level,
                    category,
                    message,
                    json.dumps(metadata) if metadata else "{}"
                )
            )
            conn.commit()
            conn.close()
            print(f"[{level}] {category}: {message}")
        except Exception as e:
            print(f"Failed to log: {e}")

    def get_logs(self, limit: int = 100, level: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves logs from the database."""
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM logs"
        params = []
        
        if level:
            query += " WHERE level = ?"
            params.append(level)
            
        query += " ORDER BY id DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row["id"],
                "timestamp": row["timestamp"],
                "level": row["level"],
                "category": row["category"],
                "message": row["message"],
                "metadata": json.loads(row["metadata"])
            }
            for row in rows
        ]

    def get_stats(self) -> Dict[str, Any]:
        """Returns log statistics."""
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT level, COUNT(*) FROM logs GROUP BY level")
        level_counts = dict(cursor.fetchall())
        
        conn.close()
        return {
            "total_logs": sum(level_counts.values()),
            "error_count": level_counts.get("ERROR", 0),
            "warning_count": level_counts.get("WARNING", 0)
        }

logger_service = LoggerService()
