import os
import pandas as pd
import numpy as np
from datetime import datetime
import sqlite3
from typing import Dict, List, Optional
import logging

class DataStorage:
    """Unified data storage system for all data types"""
    
    def __init__(self, db_path: str = "data/financial_data.db"):
        self.db_path = db_path
        self.logger = logging.getLogger('DataStorage')
        self._init_database()
    
    def _init_database(self):
        """Initialize database schema"""
        try:
            # Create data directory if it doesn't exist
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            with sqlite3.connect(self.db_path) as conn:
                # Market data table
                conn.execute("""
                CREATE TABLE IF NOT EXISTS market_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT,
                    timestamp DATETIME,
                    open REAL,
                    high REAL,
                    low REAL,
                    close REAL,
                    volume REAL,
                    source TEXT,
                    asset_type TEXT,
                    currency TEXT,
                    UNIQUE(symbol, timestamp, source)
                )
                """)
                
                # News data table
                conn.execute("""
                CREATE TABLE IF NOT EXISTS news_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    description TEXT,
                    content TEXT,
                    url TEXT,
                    source TEXT,
                    author TEXT,
                    published_at DATETIME,
                    image TEXT,
                    category TEXT,
                    sentiment_score REAL,
                    region TEXT,
                    symbols TEXT,
                    UNIQUE(url, published_at)
                )
                """)
                
                # Economic data table
                conn.execute("""
                CREATE TABLE IF NOT EXISTS economic_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    indicator_id TEXT,
                    value REAL,
                    date DATE,
                    source TEXT,
                    region TEXT,
                    currency TEXT,
                    UNIQUE(indicator_id, date)
                )
                """)
                
                # Alternative data table
                conn.execute("""
                CREATE TABLE IF NOT EXISTS alternative_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_type TEXT,
                    data_value REAL,
                    timestamp DATETIME,
                    source TEXT,
                    region TEXT,
                    description TEXT,
                    UNIQUE(data_type, timestamp, source)
                )
                """)
                
                self.logger.info("Database schema initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing database: {str(e)}")
            raise
    
    def store_market_data(self, data: List[Dict]) -> int:
        """Store market data in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                count = 0
                
                for item in data:
                    try:
                        ts = item.get('timestamp', '')
                        if hasattr(ts, 'isoformat'):
                            ts = ts.isoformat()
                        elif not isinstance(ts, str):
                            ts = str(ts)
                            
                        cursor.execute("""
                        INSERT OR REPLACE INTO market_data 
                        (symbol, timestamp, open, high, low, close, volume, source, asset_type, currency)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            item.get('symbol', ''),
                            ts,
                            item.get('open'),
                            item.get('high'),
                            item.get('low'),
                            item.get('close'),
                            item.get('volume'),
                            item.get('source', ''),
                            item.get('asset_type', ''),
                            item.get('currency', '')
                        ))
                        count += 1
                    except Exception as e:
                        self.logger.error(f"Error storing market data: {str(e)}")
                
                return count
        except Exception as e:
            self.logger.error(f"Error storing market data: {str(e)}")
            return 0
    
    def store_news_data(self, data: List[Dict]) -> int:
        """Store news data in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                count = 0
                
                for item in data:
                    try:
                        cursor.execute("""
                        INSERT OR REPLACE INTO news_data 
                        (title, description, content, url, source, author, published_at, image, category, sentiment_score, region, symbols)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            item.get('title', ''),
                            item.get('description', ''),
                            item.get('content', ''),
                            item.get('url', ''),
                            item.get('source', ''),
                            item.get('author', ''),
                            item.get('published_at', ''),
                            item.get('image', ''),
                            item.get('category', ''),
                            item.get('sentiment_score'),
                            item.get('region', ''),
                            ','.join(item.get('symbols', [])) if item.get('symbols') else ''
                        ))
                        count += 1
                    except Exception as e:
                        self.logger.error(f"Error storing news data: {str(e)}")
                
                return count
        except Exception as e:
            self.logger.error(f"Error storing news data: {str(e)}")
            return 0
    
    def store_economic_data(self, data: List[Dict]) -> int:
        """Store economic data in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                count = 0
                
                for item in data:
                    try:
                        cursor.execute("""
                        INSERT OR REPLACE INTO economic_data 
                        (indicator_id, value, date, source, region, currency)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, (
                            item.get('indicator_id', ''),
                            item.get('value'),
                            item.get('date', ''),
                            item.get('source', ''),
                            item.get('region', ''),
                            item.get('currency', '')
                        ))
                        count += 1
                    except Exception as e:
                        self.logger.error(f"Error storing economic data: {str(e)}")
                
                return count
        except Exception as e:
            self.logger.error(f"Error storing economic data: {str(e)}")
            return 0
    
    def store_alternative_data(self, data: List[Dict]) -> int:
        """Store alternative data in the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                count = 0
                
                for item in data:
                    try:
                        cursor.execute("""
                        INSERT OR REPLACE INTO alternative_data 
                        (data_type, data_value, timestamp, source, region, description)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """, (
                            item.get('data_type', ''),
                            item.get('data_value'),
                            item.get('timestamp', ''),
                            item.get('source', ''),
                            item.get('region', ''),
                            item.get('description', '')
                        ))
                        count += 1
                    except Exception as e:
                        self.logger.error(f"Error storing alternative data: {str(e)}")
                
                return count
        except Exception as e:
            self.logger.error(f"Error storing alternative data: {str(e)}")
            return 0
    
    def get_market_data(self, 
                      symbol: str, 
                      start: str = None, 
                      end: str = None,
                      timeframe: str = '1D') -> pd.DataFrame:
        """Get market data from the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                query = """
                SELECT timestamp, open, high, low, close, volume, source, asset_type, currency
                FROM market_data
                WHERE symbol = ?
                """
                
                params = [symbol]
                
                if start:
                    query += " AND timestamp >= ?"
                    params.append(start)
                
                if end:
                    query += " AND timestamp <= ?"
                    params.append(end)
                
                query += " ORDER BY timestamp"
                
                df = pd.read_sql_query(query, conn, params=params)
                
                if not df.empty:
                    df['timestamp'] = pd.to_datetime(df['timestamp'])
                    df.set_index('timestamp', inplace=True)
                
                return df
        except Exception as e:
            self.logger.error(f"Error retrieving market data: {str(e)}")
            return pd.DataFrame()
    
    def get_news_data(self, 
                     query: str = None,
                     start_date: str = None,
                     end_date: str = None,
                     category: str = None) -> List[Dict]:
        """Get news data from the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                query_str = """
                SELECT id, title, description, content, url, source, author, published_at, image, category, sentiment_score, region, symbols
                FROM news_data
                """
                
                params = []
                conditions = []
                
                if query:
                    conditions.append("title LIKE ? OR description LIKE ? OR content LIKE ?")
                    query_param = f"%{query}%"
                    params.extend([query_param, query_param, query_param])
                
                if start_date:
                    conditions.append("published_at >= ?")
                    params.append(start_date)
                
                if end_date:
                    conditions.append("published_at <= ?")
                    params.append(end_date)
                
                if category:
                    conditions.append("category = ?")
                    params.append(category)
                
                if conditions:
                    query_str += " WHERE " + " AND ".join(conditions)
                
                query_str += " ORDER BY published_at DESC LIMIT 100"
                
                cursor = conn.cursor()
                cursor.execute(query_str, params)
                
                columns = [col[0] for col in cursor.description]
                return [dict(zip(columns, row)) for row in cursor.fetchall()]
        except Exception as e:
            self.logger.error(f"Error retrieving news data: {str(e)}")
            return []
    
    def get_economic_data(self, 
                         indicator: str,
                         start_date: str = None,
                         end_date: str = None) -> pd.DataFrame:
        """Get economic data from the database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                query = """
                SELECT date, value, source, region, currency
                FROM economic_data
                WHERE indicator_id = ?
                """
                
                params = [indicator]
                
                if start_date:
                    query += " AND date >= ?"
                    params.append(start_date)
                
                if end_date:
                    query += " AND date <= ?"
                    params.append(end_date)
                
                query += " ORDER BY date"
                
                df = pd.read_sql_query(query, conn, params=params)
                
                if not df.empty:
                    df['date'] = pd.to_datetime(df['date'])
                    df.set_index('date', inplace=True)
                
                return df
        except Exception as e:
            self.logger.error(f"Error retrieving economic data: {str(e)}")
            return pd.DataFrame()
