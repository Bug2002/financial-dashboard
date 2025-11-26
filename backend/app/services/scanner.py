import asyncio
from typing import List
from app.services.analysis import analysis_service
from app.services.market_data import market_data_service
from app.services.logger import logger_service

class ScannerService:
    def __init__(self):
        self.is_running = False
        self.watched_assets = [
            "BTC-USD", "ETH-USD", "SOL-USD", # Crypto
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", # India
            "AAPL", "MSFT", "NVDA", "TSLA", # US Tech
            "^NSEI", "^GSPC" # Indices
        ]

    async def start_scanning(self):
        if self.is_running:
            return
        
        self.is_running = True
        logger_service.log("INFO", "SCANNER", "Background pattern scanner started")
        
        while self.is_running:
            try:
                for symbol in self.watched_assets:
                    # Fetch data
                    history = await market_data_service.get_price_history(symbol, days=30)
                    
                    # Detect patterns (this includes AI detection and saving to LearningService)
                    patterns = await analysis_service.detect_patterns(history, symbol)
                    
                    if patterns:
                        logger_service.log("INFO", "SCANNER", f"Detected {len(patterns)} patterns for {symbol}", {"patterns": [p['name'] for p in patterns]})
                    
                    # Sleep between assets to avoid rate limits
                    await asyncio.sleep(2)
                
                # Sleep before next full cycle
                await asyncio.sleep(60) 
                
            except Exception as e:
                logger_service.log("ERROR", "SCANNER", "Scanner cycle failed", {"error": str(e)})
                await asyncio.sleep(60) # Wait before retrying

    def stop_scanning(self):
        self.is_running = False
        logger_service.log("INFO", "SCANNER", "Background pattern scanner stopped")

scanner_service = ScannerService()
