import yfinance as yf
import time

print("Testing yfinance...")
start = time.time()
try:
    ticker = yf.Ticker("RELIANCE.NS")
    hist = ticker.history(period="5d")
    print(f"Success! Fetched {len(hist)} rows.")
    print(hist.tail())
except Exception as e:
    print(f"Failed: {e}")
print(f"Time taken: {time.time() - start:.2f}s")
