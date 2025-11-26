import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import db

class AssetService:
    def get_assets(self, limit: int = 50, offset: int = 0, asset_type: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM assets WHERE is_active = 1"
        params = []
        
        if asset_type:
            query += " AND type = ?"
            params.append(asset_type)
            
        if search:
            query += " AND (symbol LIKE ? OR name LIKE ?)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
            
        query += " ORDER BY market_cap DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]

    def get_asset_by_symbol(self, symbol: str) -> Optional[Dict[str, Any]]:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assets WHERE symbol = ?", (symbol,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
        
    def get_asset_by_id(self, asset_id: str) -> Optional[Dict[str, Any]]:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assets WHERE id = ?", (asset_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def upsert_asset(self, asset_data: Dict[str, Any]) -> str:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Check if exists
        cursor.execute("SELECT id FROM assets WHERE symbol = ? AND exchange = ?", (asset_data['symbol'], asset_data.get('exchange', 'Unknown')))
        existing = cursor.fetchone()
        
        if existing:
            asset_id = existing['id']
            cursor.execute("""
                UPDATE assets SET 
                    name = ?, type = ?, market_cap = ?, sector = ?, updated_at = ?
                WHERE id = ?
            """, (
                asset_data.get('name'), 
                asset_data.get('type'), 
                asset_data.get('market_cap'), 
                asset_data.get('sector'),
                datetime.now().isoformat(),
                asset_id
            ))
        else:
            asset_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO assets (id, symbol, name, type, exchange, currency, market_cap, sector, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                asset_id,
                asset_data['symbol'],
                asset_data.get('name'),
                asset_data.get('type'),
                asset_data.get('exchange', 'Unknown'),
                asset_data.get('currency', 'USD'),
                asset_data.get('market_cap'),
                asset_data.get('sector'),
                datetime.now().isoformat()
            ))
            
        conn.commit()
        conn.close()
        return asset_id

    def create_watchlist(self, name: str) -> str:
        conn = db.get_connection()
        cursor = conn.cursor()
        watchlist_id = str(uuid.uuid4())
        cursor.execute("INSERT INTO watchlists (id, name, created_at) VALUES (?, ?, ?)", (watchlist_id, name, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        return watchlist_id

    def add_to_watchlist(self, watchlist_id: str, asset_id: str):
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO watchlist_items (watchlist_id, asset_id, added_at) VALUES (?, ?, ?)", (watchlist_id, asset_id, datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def get_watchlist(self, watchlist_id: str) -> List[Dict[str, Any]]:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.* FROM assets a
            JOIN watchlist_items wi ON a.id = wi.asset_id
            WHERE wi.watchlist_id = ?
        """, (watchlist_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

asset_service = AssetService()
