import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

class NewsService:
    def __init__(self):
        self.trusted_sources = ["Reuters", "Bloomberg", "WSJ", "Financial Times", "Official Press Release"]
        self.medium_sources = ["CNBC", "TechCrunch", "CoinDesk", "MarketWatch"]
        # Others are considered Low credibility for this MVP

    def _calculate_credibility(self, publisher: str) -> str:
        if publisher in self.trusted_sources:
            return "High"
        elif publisher in self.medium_sources:
            return "Medium"
        return "Low"

    def get_news(self, symbol: str) -> List[Dict[str, Any]]:
        # Mock news generation
        news_items = []
        publishers = self.trusted_sources + self.medium_sources + ["CryptoBuzz", "StockRumors", "DailyTrader"]
        
        templates = [
            f"{symbol} reports strong earnings growth in Q3.",
            f"Analysts upgrade {symbol} to Buy rating.",
            f"Regulatory concerns loom over {symbol} sector.",
            f"New product launch drives {symbol} stock higher.",
            f"CEO of {symbol} announces strategic partnership.",
            f"Market volatility impacts {symbol} performance.",
            f"Rumor: {symbol} considering acquisition of competitor.",
            f"Why {symbol} is the top pick for 2025."
        ]

        now = datetime.now()

        for i in range(5):
            publisher = random.choice(publishers)
            credibility = self._calculate_credibility(publisher)
            
            news_items.append({
                "id": f"news-{i}",
                "title": random.choice(templates),
                "publisher": publisher,
                "timestamp": (now - timedelta(hours=random.randint(1, 48))).isoformat(),
                "credibility": credibility,
                "url": f"https://www.google.com/search?q={symbol}+{publisher.replace(' ', '+')}+news" # Mock link to Google Search
            })
        
        # Sort by timestamp desc
        news_items.sort(key=lambda x: x["timestamp"], reverse=True)
        return news_items

news_service = NewsService()
