import sqlite3
import yfinance as yf
import json

def check_schema():
    print("--- Schema ---")
    try:
        conn = sqlite3.connect('data/news.db')
        cursor = conn.cursor()
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='news'")
        print(cursor.fetchone()[0])
        
        print("\n--- Current Data Sample ---")
        cursor.execute("SELECT * FROM news LIMIT 1")
        print(cursor.fetchone())
        
        # Clear bad data
        print("\n--- Clearing Bad Data ---")
        cursor.execute("DELETE FROM news")
        conn.commit()
        print("News table cleared.")
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

def check_yfinance():
    print("\n--- YFinance Structure ---")
    try:
        ticker = yf.Ticker('RELIANCE.NS')
        news = ticker.news
        if news:
            print("Keys in first item:")
            print(list(news[0].keys()))
            print("First item sample (safe print):")
            item = news[0]
            safe_item = {k: str(v).encode('ascii', 'ignore').decode('ascii') for k, v in item.items()}
            print(json.dumps(safe_item, indent=2))
        else:
            print("No news found.")
    except Exception as e:
        print(f"YFinance Error: {e}")

if __name__ == "__main__":
    check_schema()
    check_yfinance()
