import sqlite3
import json
import logging
from datetime import datetime
import os

class StorageEngine:
    """
    High-performance persistence layer for trades, signals, and audit events.
    Uses SQLite with optimized WAL mode for concurrent access.
    """
    def __init__(self, db_path: str = "trading_system.db"):
        self.db_path = db_path
        self.logger = logging.getLogger("Database.StorageEngine")
        self._init_db()

    def _init_db(self):
        """Initializes the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enable WAL mode for better concurrency
        cursor.execute("PRAGMA journal_mode=WAL")
        
        # Trades Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                symbol TEXT,
                side TEXT,
                quantity REAL,
                price REAL,
                pnl REAL,
                timestamp TEXT,
                strategy TEXT
            )
        """)
        
        # Signals Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                action TEXT,
                confidence REAL,
                sentiment REAL,
                timestamp TEXT,
                source TEXT
            )
        """)
        
        # Audit Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                event_type TEXT,
                severity TEXT,
                details TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        self.logger.info("Storage Engine initialized with optimized schema.")

    def save_trade(self, trade_data: dict):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO trades (id, symbol, side, quantity, price, pnl, timestamp, strategy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trade_data.get('id'),
            trade_data.get('symbol'),
            trade_data.get('side'),
            trade_data.get('quantity'),
            trade_data.get('price'),
            trade_data.get('pnl', 0.0),
            trade_data.get('timestamp', datetime.utcnow().isoformat()),
            trade_data.get('strategy', 'MANUAL')
        ))
        conn.commit()
        conn.close()

    def save_signal(self, signal_data: dict):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO signals (symbol, action, confidence, sentiment, timestamp, source)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            signal_data.get('symbol'),
            signal_data.get('action'),
            signal_data.get('confidence'),
            signal_data.get('sentiment', 0.0),
            signal_data.get('timestamp', datetime.utcnow().isoformat()),
            signal_data.get('source', 'AI_ENGINE')
        ))
        conn.commit()
        conn.close()

    def get_recent_trades((self, limit: int = 50) -> list):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def get_performance_stats(self) -> dict:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*), SUM(pnl), AVG(pnl) FROM trades")
        count, total_pnl, avg_pnl = cursor.fetchone()
        conn.close()
        return {
            'total_trades': count or 0,
            'total_pnl': total_pnl or 0.0,
            'avg_pnl': avg_pnl or 0.0
        }
