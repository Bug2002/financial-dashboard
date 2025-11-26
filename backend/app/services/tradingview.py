from tradingview_ta import TA_Handler, Interval, Exchange
import logging

logger = logging.getLogger(__name__)

class TradingViewService:
    def get_technical_analysis(self, symbol: str, screener: str = "india", exchange: str = "NSE", interval: str = Interval.INTERVAL_1_DAY):
        """
        Fetch technical analysis from TradingView.
        """
        try:
            # Handle crypto symbols (e.g., BTC-USD)
            if "-USD" in symbol:
                screener = "crypto"
                exchange = "BINANCE"
                symbol = symbol.replace("-USD", "USDT")
            
            # Handle NSE symbols (remove .NS suffix if present)
            if symbol.endswith(".NS"):
                symbol = symbol.replace(".NS", "")
                screener = "india"
                exchange = "NSE"

            handler = TA_Handler(
                symbol=symbol,
                screener=screener,
                exchange=exchange,
                interval=interval
            )
            
            analysis = handler.get_analysis()
            return {
                "summary": analysis.summary,
                "oscillators": analysis.oscillators,
                "moving_averages": analysis.moving_averages,
                "indicators": analysis.indicators,
                "time": analysis.time.isoformat()
            }
        except Exception as e:
            logger.error(f"TradingView analysis failed for {symbol}: {e}")
            return None

tradingview_service = TradingViewService()
