import sqlite3
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_FILE = "data/assets.db"

class Database:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        self._ensure_db()

    def get_connection(self):
        if self.db_url:
            conn = psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
            return conn
        else:
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            return conn

    def _ensure_db(self):
        if not self.db_url and not os.path.exists("data"):
            os.makedirs("data")
            
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Adjust types for Postgres vs SQLite compatibility
        # SQLite uses TEXT for timestamps, Postgres can use TIMESTAMP but TEXT works for now
        # SQLite uses INTEGER for boolean (0/1), Postgres has native BOOLEAN
        
        # Assets Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                symbol TEXT NOT NULL,
                name TEXT,
                type TEXT, -- 'Stock', 'Crypto'
                exchange TEXT,
                currency TEXT,
                market_cap BIGINT,
                sector TEXT,
                industry TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                updated_at TEXT,
                UNIQUE(symbol, exchange)
            )
        """)
        
        # Price Timeseries Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS price_timeseries (
                asset_id TEXT,
                timestamp TEXT,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume BIGINT,
                PRIMARY KEY (asset_id, timestamp),
                FOREIGN KEY(asset_id) REFERENCES assets(id)
            )
        """)
        
        # Watchlists Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watchlists (
                id TEXT PRIMARY KEY,
                name TEXT,
                created_at TEXT
            )
        """)
        
        # Watchlist Items Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watchlist_items (
                watchlist_id TEXT,
                asset_id TEXT,
                added_at TEXT,
                PRIMARY KEY (watchlist_id, asset_id),
                FOREIGN KEY(watchlist_id) REFERENCES watchlists(id),
                FOREIGN KEY(asset_id) REFERENCES assets(id)
            )
        """)
        
        conn.commit()
        conn.close()

    def execute(self, query: str, params: tuple = ()):
        """
        Execute a query with parameters, handling placeholder differences.
        SQLite uses ?, Postgres uses %s.
        """
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if self.db_url:
                # Postgres: Replace ? with %s
                query = query.replace('?', '%s')
            
            cursor.execute(query, params)
            
            if query.strip().upper().startswith("SELECT"):
                result = cursor.fetchall()
                # Convert RealDictRow to dict for consistency if needed, but it behaves like dict
                return [dict(row) for row in result]
            else:
                conn.commit()
                return cursor.lastrowid # Note: Postgres might not return this same way without RETURNING
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def execute_one(self, query: str, params: tuple = ()):
        """
        Execute a query and return one result.
        """
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            if self.db_url:
                query = query.replace('?', '%s')
                
            cursor.execute(query, params)
            result = cursor.fetchone()
            return dict(result) if result else None
        except Exception as e:
            raise e
        finally:
            conn.close()

# Global instance
db = Database()
