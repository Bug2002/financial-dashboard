import yfinance as yf
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import asyncio
import json
import os
from app.services.asset_service import asset_service

CACHE_FILE_PATH = "data/market_cache.json"

class MarketDataService:
    async def search_assets(self, query: str) -> List[Dict[str, str]]:
        # Use the DB-backed AssetService
        assets = asset_service.get_assets(search=query, limit=10)
        
        # Map to expected frontend format
        results = []
        for asset in assets:
            results.append({
                "symbol": asset["symbol"],
                "name": asset["name"] or asset["symbol"],
                "type": asset["type"] or "Unknown"
            })
            
        # Fallback: If no results in DB, allow pass-through for direct lookup (and maybe auto-ingest later)
        if not results and len(query) >= 2:
             results.append({"symbol": query.upper(), "name": query.upper(), "type": "Unknown"})
             
        return results

    async def get_price_history(self, symbol: str, days: int = 30) -> List[Dict[str, Any]]:
        try:
            ticker = yf.Ticker(symbol)
            # Fetch slightly more data to ensure we have enough for 'days'
            # yfinance period options: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
            period = "1mo"
            if days > 30: period = "3mo"
            if days > 90: period = "1y"
            
            # Run blocking call in executor
            print(f"DEBUG: Fetching history for {symbol} period={period}")
            # hist = await asyncio.to_thread(ticker.history, period=period)
            hist = ticker.history(period=period)
            print(f"DEBUG: Fetched {len(hist)} rows")
            
            # Format data
            data = []
            for date, row in hist.iterrows():
                # Convert numpy types to python types for JSON serialization
                open_val = float(row["Open"]) if not pd.isna(row["Open"]) else 0.0
                high_val = float(row["High"]) if not pd.isna(row["High"]) else 0.0
                low_val = float(row["Low"]) if not pd.isna(row["Low"]) else 0.0
                close_val = float(row["Close"]) if not pd.isna(row["Close"]) else 0.0
                volume_val = int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
                
                data.append({
                    "time": date.isoformat(),
                    "open": open_val,
                    "high": high_val,
                    "low": low_val,
                    "close": close_val,
                    "volume": volume_val
                })
            
            # Filter to requested days (approx)
            if len(data) > days:
                data = data[-days:]
                
            return data
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return []

    async def check_data_freshness(self, symbol: str) -> bool:
        """
        Checks if we have recent data for the symbol (within last 24h).
        Returns True if fresh, False if stale/missing.
        """
        # In a real DB-backed system, we'd query the max timestamp from the price_history table.
        # Since we are currently fetching live from yfinance on demand in get_price_history,
        # we can assume "stale" if we haven't fetched it recently (cache check) 
        # OR we can just rely on get_price_history to always fetch fresh data.
        
        # For this "Autonomous" demo, let's simulate a check.
        # We'll say it's stale if we can't get data or if the last data point is old.
        try:
            # We'll use a lightweight fetch (1d) to check
            ticker = yf.Ticker(symbol)
            hist = await asyncio.to_thread(ticker.history, period="1d")
            if hist.empty:
                return False
            
            last_date = hist.index[-1]
            # Naive check: is last date within last 3 days (to account for weekends)?
            if (datetime.now(last_date.tzinfo) - last_date).days > 3:
                return False
                
            return True
        except Exception:
            return False

    def __init__(self):
        self._movers_cache = None
        self._movers_cache_time = None

    async def get_market_movers(self):
        """
        Get top gainers, losers, and active stocks.
        Uses a subset of NIFTY 50 for now to avoid rate limits on full market scan.
        """
        # 1. Check Memory Cache
        if self._movers_cache and self._movers_cache_time and (datetime.now() - self._movers_cache_time).total_seconds() < 300:
            print("DEBUG: Returning movers from memory cache")
            return self._movers_cache

        # 2. Check File Cache (Persistent)
        try:
            print(f"DEBUG: Checking file cache at {os.path.abspath(CACHE_FILE_PATH)}", flush=True)
            if os.path.exists(CACHE_FILE_PATH):
                with open(CACHE_FILE_PATH, 'r') as f:
                    cache_data = json.load(f)
                    cache_time = datetime.fromisoformat(cache_data['timestamp'])
                    # Use file cache if less than 30 mins old
                    if (datetime.now() - cache_time).total_seconds() < 1800:
                        self._movers_cache = cache_data['data']
                        self._movers_cache_time = datetime.now() # Refresh memory cache time
                        print("DEBUG: Loaded market movers from persistent cache.", flush=True)
                        return self._movers_cache
                    else:
                        print("DEBUG: File cache is stale", flush=True)
            else:
                print("DEBUG: File cache does not exist", flush=True)
        except Exception as e:
            print(f"Error reading cache file: {e}", flush=True)

        try:
            print("DEBUG: Fetching fresh market movers data...", flush=True)
            # Fetch all assets from DB to show "All"
            # Optimization: Limit to top 10 for MVP to avoid slow load times
            db_assets = asset_service.get_assets(limit=10)
            tickers = [a['symbol'] for a in db_assets]
            
            # Fallback if DB is empty (shouldn't be after seed)
            if not tickers:
                tickers = ["^NSEI", "RELIANCE.NS", "AAPL", "BTC-USD"]
            
            # Batch fetch for efficiency
            # Use 5d to ensure we get data even on weekends/holidays for stocks
            from app.services.logger import logger_service
            logger_service.log("INFO", "MARKET_DATA", f"Fetching movers for {len(tickers)} tickers", {"tickers": tickers})
            data = await asyncio.to_thread(yf.download, tickers, period="5d", group_by='ticker', progress=False)
            logger_service.log("INFO", "MARKET_DATA", "Fetched data columns", {"columns": str(data.columns)})
            
            # Create a map for types
            type_map = {a['symbol']: a['type'] for a in db_assets}

            movers = []
            for ticker in tickers:
                try:
                    # Handle yfinance multi-index structure or single ticker
                    if len(tickers) > 1:
                        if ticker in data.columns.levels[0]: # Check if ticker is in top level columns
                             hist = data[ticker]
                        else:
                             # logger_service.log("WARNING", "MARKET_DATA", f"No data for {ticker}")
                             continue
                    else:
                        hist = data
                        
                    if not hist.empty and len(hist) > 0:
                        current = hist['Close'].iloc[-1]
                        open_price = hist['Open'].iloc[-1]
                        change = ((current - open_price) / open_price) * 100
                        
                        movers.append({
                            "symbol": ticker,
                            "price": float(current),
                            "change": float(change),
                            "volume": int(hist['Volume'].iloc[-1]),
                            "type": type_map.get(ticker, "Crypto" if "-USD" in ticker else "Stock")
                        })
                except Exception as e:
                    continue

            # Sort lists
            movers.sort(key=lambda x: x['change'], reverse=True)
            
            # Update Memory Cache
            self._movers_cache = movers
            self._movers_cache_time = datetime.now()

            # Update File Cache
            try:
                print(f"DEBUG: Writing to file cache at {os.path.abspath(CACHE_FILE_PATH)}")
                os.makedirs(os.path.dirname(CACHE_FILE_PATH), exist_ok=True)
                with open(CACHE_FILE_PATH, 'w') as f:
                    json.dump({
                        'timestamp': datetime.now().isoformat(),
                        'data': movers
                    }, f)
                print("DEBUG: Successfully wrote to cache file")
            except Exception as e:
                print(f"Error writing cache file: {e}")

            # Return flat list for frontend filtering
            return movers
            
        except Exception as e:
            print(f"Error fetching movers: {e}")
            return []

    async def ingest_global_data(self):
        """
        Ingest a starting set of global assets into the DB.
        This would be a background worker in a real app.
        """
        initial_assets = [
            # Indian Stocks
            {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "type": "Stock", "exchange": "NSE"},
            {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "type": "Stock", "exchange": "NSE"},
            {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "type": "Stock", "exchange": "NSE"},
            {"symbol": "INFY.NS", "name": "Infosys", "type": "Stock", "exchange": "NSE"},
            {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "type": "Stock", "exchange": "NSE"},
            {"symbol": "SBIN.NS", "name": "State Bank of India", "type": "Stock", "exchange": "NSE"},
            {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "type": "Stock", "exchange": "NSE"},
            {"symbol": "ITC.NS", "name": "ITC Limited", "type": "Stock", "exchange": "NSE"},
            {"symbol": "TATAMOTORS.NS", "name": "Tata Motors", "type": "Stock", "exchange": "NSE"},
            {"symbol": "MARUTI.NS", "name": "Maruti Suzuki", "type": "Stock", "exchange": "NSE"},
            
            # US Stocks
            {"symbol": "AAPL", "name": "Apple Inc.", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "MSFT", "name": "Microsoft Corp", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "AMZN", "name": "Amazon.com", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "NVDA", "name": "NVIDIA Corp", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "META", "name": "Meta Platforms", "type": "Stock", "exchange": "NASDAQ"},
            {"symbol": "NFLX", "name": "Netflix Inc.", "type": "Stock", "exchange": "NASDAQ"},
            
            # Crypto
            {"symbol": "BTC-USD", "name": "Bitcoin", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "ETH-USD", "name": "Ethereum", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "SOL-USD", "name": "Solana", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "BNB-USD", "name": "Binance Coin", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "XRP-USD", "name": "XRP", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "ADA-USD", "name": "Cardano", "type": "Crypto", "exchange": "CoinGecko"},
            {"symbol": "DOGE-USD", "name": "Dogecoin", "type": "Crypto", "exchange": "CoinGecko"},
        ]
        
        count = 0
        for asset in initial_assets:
            # In a real worker, we might fetch more metadata here from yf.Ticker(asset['symbol']).info
            asset_service.upsert_asset(asset)
            count += 1
            
        return {"status": "success", "ingested": count}

market_data_service = MarketDataService()
