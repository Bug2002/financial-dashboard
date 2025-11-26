import yfinance as yf
import sys

try:
    print("Fetching data for RELIANCE.NS...")
    ticker = yf.Ticker("RELIANCE.NS")
    hist = ticker.history(period="1mo")
    print(f"Success! Got {len(hist)} rows.")
    print(hist.head())
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
