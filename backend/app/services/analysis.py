import random
from typing import List, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
from app.services.llm import llm_service
from app.services.learning import learning_service
from app.services.strategies.graham import graham_strategy
from app.services.strategies.lynch import lynch_strategy
from app.services.strategies.buffett import buffett_strategy
from app.services.strategies.taleb import taleb_strategy
from app.services.strategies.housel import housel_strategy

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

    async def detect_patterns(self, price_history: List[Dict[str, Any]], symbol: str = "Asset") -> List[Dict[str, Any]]:
        patterns = []
        if len(price_history) < 20:
            return patterns

        current_price = price_history[-1]["close"]
        
        # 0. Validate past patterns
        learning_service.validate_patterns(symbol, current_price)

        # 1. Get algorithmic patterns (RSI, SMA) as a baseline
        closes = [p["close"] for p in price_history]
        current_rsi = self.calculate_rsi(closes)
        
        if current_rsi > 70:
            patterns.append({
                "name": "RSI Overbought",
                "type": "Bearish",
                "description": f"RSI is {current_rsi:.1f}, indicating potential reversal.",
                "reliability": "Medium",
                "timestamp": price_history[-1]["time"]
            })
        elif current_rsi < 30:
            patterns.append({
                "name": "RSI Oversold",
                "type": "Bullish",
                "description": f"RSI is {current_rsi:.1f}, indicating potential bounce.",
                "reliability": "Medium",
                "timestamp": price_history[-1]["time"]
            })
            
        # Simple SMA Crossover (Golden Cross / Death Cross)
        if len(closes) > 50:
            sma20 = pd.Series(closes).rolling(window=20).mean().iloc[-1]
            sma50 = pd.Series(closes).rolling(window=50).mean().iloc[-1]
            prev_sma20 = pd.Series(closes).rolling(window=20).mean().iloc[-2]
            prev_sma50 = pd.Series(closes).rolling(window=50).mean().iloc[-2]
            
            if prev_sma20 < prev_sma50 and sma20 > sma50:
                patterns.append({
                    "name": "Golden Cross",
                    "type": "Bullish",
                    "description": "SMA 20 crossed above SMA 50.",
                    "reliability": "High",
                    "timestamp": price_history[-1]["time"]
                })
            elif prev_sma20 > prev_sma50 and sma20 < sma50:
                patterns.append({
                    "name": "Death Cross",
                    "type": "Bearish",
                    "description": "SMA 20 crossed below SMA 50.",
                    "reliability": "High",
                    "timestamp": price_history[-1]["time"]
                })

        # 2. Get AI-detected patterns
        try:
            ai_patterns = await llm_service.detect_patterns(symbol, price_history)
            # Add timestamp and save to learning service
            for p in ai_patterns:
                if "timestamp" not in p:
                    p["timestamp"] = price_history[-1]["time"]
                
                # Inject performance stats if available
                stats = learning_service.get_pattern_performance(p["name"])
                if stats["total"] > 0:
                    p["description"] += f" (Hist. Success: {stats['success_rate']}%)"
                
                patterns.append(p)
                
                # Save for future validation
                p_to_save = p.copy()
                p_to_save["entry_price"] = current_price
                learning_service.save_pattern_event(symbol, p_to_save)
                
        except Exception as e:
            print(f"Error getting AI patterns: {e}")

        return patterns

    async def predict_future(self, price_history: List[Dict[str, Any]], news: List[Dict[str, Any]] = [], symbol: str = "Asset") -> Dict[str, Any]:
        if not price_history:
            return {}
            
        current_price = price_history[-1]["close"]
        
        # 1. Validate past predictions
        learning_service.validate_predictions(symbol, current_price)
        
        # 2. Get learning context
        context = learning_service.get_learning_context(symbol)

        # 3. Get Technical Analysis (TradingView)
        from app.services.tradingview import tradingview_service
        import asyncio
        # Run in thread pool to avoid blocking
        technicals = await asyncio.to_thread(tradingview_service.get_technical_analysis, symbol)
        
        # 4. Use LLM for smart analysis with context and technicals
        ai_analysis = await llm_service.analyze_market(symbol, price_history, news, technicals, learning_context=context)
        
        # Mock prediction logic for price targets (LLM usually bad at exact numbers without tools)
        recent_return = (current_price - price_history[-5]["close"]) / price_history[-5]["close"]
        drift = recent_return * 0.5 
        
        predicted_change = drift + random.uniform(-0.05, 0.05)
        predicted_price = current_price * (1 + predicted_change)
        
        volatility = random.uniform(0.02, 0.08)
        lower_bound = predicted_price * (1 - volatility)
        upper_bound = predicted_price * (1 + volatility)

        # 5. Apply Investment Strategies (Graham, Lynch, Buffett, Taleb, Housel)
        # Mock fundamental data for now (would come from API)
        fundamental_data = {
            "pe_ratio": 12.5,
            "pb_ratio": 1.2,
            "current_ratio": 2.5,
            "debt_to_equity": 0.4,
            "earnings_growth": 18.0, # Lynch sweet spot
            "dividend_yield": 1.5,
            "institutional_ownership": 25.0, # Low ownership (hidden gem)
            "roe": 22.0, # Buffett Moat
            "gross_margin": 45.0, # High margin
            "fcf_yield": 6.0,
            "beta": 1.2, # Taleb Volatility
            "max_drawdown": -12.0, # Taleb Drawdown
            "insider_ownership": 12.0, # Taleb Skin in the Game
            "recent_gain_pct": 15.0 # Housel FOMO check
        }
        
        # Mock technicals for Housel
        technicals_data = {
            "rsi": ai_analysis.get("technicals", {}).get("rsi", 50)
        }
        
        graham_result = graham_strategy.evaluate(fundamental_data)
        lynch_result = lynch_strategy.evaluate(fundamental_data)
        buffett_result = buffett_strategy.evaluate(fundamental_data)
        taleb_result = taleb_strategy.evaluate(fundamental_data)
        housel_result = housel_strategy.evaluate(fundamental_data, technicals_data)
        
        prediction_result = {
            "horizon_days": 7,
            "current_price": current_price,
            "predicted_price": round(predicted_price, 2),
            "predicted_change_pct": round(predicted_change * 100, 2),
            "lower_bound": round(lower_bound, 2),
            "upper_bound": round(upper_bound, 2),
            "signal": ai_analysis.get("signal", "Neutral"),
            "confidence": ai_analysis.get("confidence", 0.5),
            "reasoning": ai_analysis.get("reasoning", "Analysis based on technical indicators."),
            "accuracy": learning_service.get_accuracy_score(symbol),
            "graham_analysis": graham_result,
            "lynch_analysis": lynch_result,
            "buffett_analysis": buffett_result,
            "taleb_analysis": taleb_result,
            "housel_analysis": housel_result,
            "timestamp": datetime.now().isoformat()
        }
        
        # 6. Save new prediction for future learning
        learning_service.save_prediction(symbol, prediction_result)
        
        return prediction_result

analysis_service = AnalysisService()
