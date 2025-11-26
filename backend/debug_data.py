import yfinance as yf
import requests
import json

def test_yfinance(symbol):
    print(f"Testing yfinance for {symbol}...")
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1mo", interval="1d")
        print(f"History shape: {hist.shape}")
        if not hist.empty:
            print(hist.tail())
        else:
            print("History is empty!")
    except Exception as e:
        print(f"yfinance error: {e}")

def test_api(symbol):
    print(f"\nTesting API for {symbol}...")
    try:
        response = requests.get(f"http://127.0.0.1:8002/api/v1/asset/{symbol}/price")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Data length: {len(data)}")
            if data:
                print(data[-1])
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"API connection error: {e}")

if __name__ == "__main__":
    test_yfinance("RELIANCE.NS")
    test_api("RELIANCE.NS")
