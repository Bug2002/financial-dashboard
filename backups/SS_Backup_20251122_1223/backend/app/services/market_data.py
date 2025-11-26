import yfinance as yf
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd

class MarketDataService:
    async def search_assets(self, query: str) -> List[Dict[str, str]]:
        # yfinance doesn't have a great search API, so we'll stick to a predefined list + the query if it looks like a ticker
        # In a real app, we'd use a dedicated search API like AlphaVantage or Yahoo Finance Autocomplete API directly
        
        common_assets = [
            {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "type": "Stock"},
            {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "type": "Stock"},
            {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "type": "Stock"},
            {"symbol": "INFY.NS", "name": "Infosys", "type": "Stock"},
            {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "type": "Stock"},
            {"symbol": "SBIN.NS", "name": "State Bank of India", "type": "Stock"},
            {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "type": "Stock"},
            {"symbol": "ITC.NS", "name": "ITC Limited", "type": "Stock"},
            {"symbol": "^NSEI", "name": "NIFTY 50", "type": "Index"},
            {"symbol": "^BSESN", "name": "SENSEX", "type": "Index"},
            {"symbol": "AAPL", "name": "Apple Inc.", "type": "Stock"},
            {"symbol": "BTC-USD", "name": "Bitcoin USD", "type": "Crypto"},
        ]
        
        query = query.upper()
        results = [asset for asset in common_assets if query in asset["symbol"] or query in asset["name"].upper()]
        
        # If query looks like a ticker and not in list, add it
        if len(query) >= 2 and not any(asset["symbol"] == query for asset in results):
             results.append({"symbol": query, "name": query, "type": "Unknown"})
             
        return results

    async def get_price_history(self, symbol: str, days: int = 30) -> List[Dict[str, Any]]:
        try:
            ticker = yf.Ticker(symbol)
            # Fetch slightly more data to ensure we have enough for 'days'
            # yfinance period options: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max
            period = "1mo"
            if days > 30: period = "3mo"
            if days > 90: period = "1y"
            
            hist = ticker.history(period=period)
            
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
            import traceback
            with open("backend_error.log", "w") as f:
                f.write(str(e))
                f.write("\n")
                f.write(traceback.format_exc())
            print(f"Error fetching data for {symbol}: {e}")
            return []

market_data_service = MarketDataService()
