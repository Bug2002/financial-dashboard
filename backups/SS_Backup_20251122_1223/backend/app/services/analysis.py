import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

class AnalysisService:
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        if len(prices) < period + 1:
            return 50.0  # Default neutral
        
        deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        gains = [d for d in deltas if d > 0]
        losses = [-d for d in deltas if d < 0]
        
        avg_gain = sum(gains) / period if gains else 0
        avg_loss = sum(losses) / period if losses else 0
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))

    def detect_patterns(self, price_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        patterns = []
        if len(price_history) < 20:
            return patterns

        closes = [p["close"] for p in price_history]
        
        # RSI Pattern
        current_rsi = self.calculate_rsi(closes)
        if current_rsi > 70:
            patterns.append({
                "name": "RSI Overbought",
                "type": "Bearish",
                "description": f"RSI is {current_rsi:.1f}, indicating potential reversal.",
                "timestamp": price_history[-1]["time"]
            })
        elif current_rsi < 30:
            patterns.append({
                "name": "RSI Oversold",
                "type": "Bullish",
                "description": f"RSI is {current_rsi:.1f}, indicating potential bounce.",
                "timestamp": price_history[-1]["time"]
            })

        # Simple Moving Average Crossover (Mock logic for MVP as we need more data for real 50/200 SMA)
        # We'll just check short term trend vs long term trend of available data
        short_ma = sum(closes[-5:]) / 5
        long_ma = sum(closes[-20:]) / 20
        
        prev_short_ma = sum(closes[-6:-1]) / 5
        prev_long_ma = sum(closes[-21:-1]) / 20

        if prev_short_ma < prev_long_ma and short_ma > long_ma:
            patterns.append({
                "name": "Golden Cross (Simulated)",
                "type": "Bullish",
                "description": "Short-term average crossed above long-term average.",
                "timestamp": price_history[-1]["time"]
            })
        elif prev_short_ma > prev_long_ma and short_ma < long_ma:
            patterns.append({
                "name": "Death Cross (Simulated)",
                "type": "Bearish",
                "description": "Short-term average crossed below long-term average.",
                "timestamp": price_history[-1]["time"]
            })

        return patterns

    def predict_future(self, price_history: List[Dict[str, Any]], horizon_days: int = 7) -> Dict[str, Any]:
        if not price_history:
            return {}
            
        current_price = price_history[-1]["close"]
        
        # Mock prediction logic: Random walk with slight drift based on recent trend
        recent_return = (current_price - price_history[-5]["close"]) / price_history[-5]["close"]
        drift = recent_return * 0.5 # Dampen the trend
        
        predicted_change = drift + random.uniform(-0.05, 0.05)
        predicted_price = current_price * (1 + predicted_change)
        
        # Confidence based on volatility
        volatility = random.uniform(0.02, 0.08)
        lower_bound = predicted_price * (1 - volatility)
        upper_bound = predicted_price * (1 + volatility)
        
        signal = "Neutral"
        if predicted_change > 0.02:
            signal = "Buy"
        elif predicted_change < -0.02:
            signal = "Sell"
            
        confidence = max(0.1, min(0.95, 1.0 - volatility * 5)) # Higher volatility -> Lower confidence

        return {
            "horizon_days": horizon_days,
            "current_price": current_price,
            "predicted_price": round(predicted_price, 2),
            "predicted_change_pct": round(predicted_change * 100, 2),
            "lower_bound": round(lower_bound, 2),
            "upper_bound": round(upper_bound, 2),
            "signal": signal,
            "confidence": round(confidence, 2),
            "timestamp": datetime.now().isoformat()
        }

analysis_service = AnalysisService()
