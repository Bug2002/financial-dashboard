import os
import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        self.openai_client = None
        if self.openai_key:
            try:
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("OpenAI client initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")

        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini client initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")

    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        import asyncio
        def _sync_call():
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a financial analyst AI. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
            
        return await asyncio.to_thread(_sync_call)

    async def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        import asyncio
        def _sync_call():
            response = self.gemini_model.generate_content(prompt)
            text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
            
        return await asyncio.to_thread(_sync_call)

    async def analyze_market(self, symbol: str, price_history: List[Dict[str, Any]], news: List[Dict[str, Any]], technicals: Dict[str, Any] = None, learning_context: str = "") -> Dict[str, Any]:
        """
        Analyzes market data and news to generate a buy/sell signal and reasoning.
        """
        prompt = self._construct_prompt(symbol, price_history, news, technicals, learning_context)
        
        # Try OpenAI first
        if self.openai_client:
            try:
                return await self._call_openai(prompt)
            except Exception as e:
                logger.error(f"OpenAI call failed: {e}")
        
        # Fallback to Gemini
        if self.gemini_key:
            try:
                return await self._call_gemini(prompt)
            except Exception as e:
                logger.error(f"Gemini call failed: {e}")

        # Fallback if both fail or no keys
        return self._mock_analysis(symbol, price_history)

    def _construct_prompt(self, symbol: str, price_history: List[Dict[str, Any]], news: List[Dict[str, Any]], technicals: Dict[str, Any], learning_context: str) -> str:
        # Format recent price data (last 5 days)
        recent_prices = price_history[-5:] if len(price_history) >= 5 else price_history
        price_str = "\n".join([f"{p['time']}: Close {p['close']}" for p in recent_prices])
        
        # Format recent news (last 3 items)
        recent_news = news[:3] if len(news) >= 3 else news
        news_str = "\n".join([f"- {n['title']} ({n['publisher']})" for n in recent_news])
        
        # Format Technicals
        tech_str = "No technical data available."
        if technicals:
            summary = technicals.get('summary', {})
            oscillators = technicals.get('oscillators', {})
            mavgs = technicals.get('moving_averages', {})
            tech_str = f"""
            Overall Recommendation: {summary.get('RECOMMENDATION', 'N/A')}
            Buy Count: {summary.get('BUY', 0)}, Sell Count: {summary.get('SELL', 0)}
            Oscillators: {oscillators.get('RECOMMENDATION', 'N/A')}
            Moving Averages: {mavgs.get('RECOMMENDATION', 'N/A')}
            """

        return f"""
        You are a top-rated technical analyst on TradingView, known for high-accuracy, confluence-based setups.
        Your goal is to provide a professional trading signal based on Price Action, Technical Indicators, and Fundamental Context.

        Asset: {symbol}

        1. Technical Overview (TradingView Data):
        {tech_str}

        2. Recent Price Action (OHLCV):
        {price_str}

        3. Fundamental Context (News):
        {news_str}

        4. Historical Performance Context (Learn from this):
        {learning_context}

        Task:
        Analyze the confluence of these factors. Look for setups like:
        - Trend Confirmations (e.g., Strong Buy + Price making higher highs)
        - Divergences (e.g., Price rising but Oscillators showing Sell)
        - Reversals (e.g., Oversold RSI + Support level)

        Output a JSON object with the following structure:
        {{
            "signal": "Buy" | "Sell" | "Neutral",
            "confidence": float (0.0 to 1.0),
            "reasoning": "A concise, professional summary of the setup (max 2 sentences). Mention specific indicators or patterns.",
            "key_levels": {{
                "entry": float (suggested entry price),
                "stop_loss": float (invalidation level),
                "target": float (profit target)
            }}
        }}
        """



    def _mock_analysis(self, symbol: str, price_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Fallback analysis when LLMs are unavailable.
        """
        current_price = price_history[-1]["close"] if price_history else 100
        
        return {
            "signal": "Neutral",
            "confidence": 0.5,
            "reasoning": "AI services unavailable. Showing neutral stance based on market data availability.",
            "key_levels": {
                "entry": current_price,
                "stop_loss": current_price * 0.95,
                "target": current_price * 1.05
            }
        }

    async def detect_patterns(self, symbol: str, price_history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Uses LLM to detect technical chart patterns from price history.
        """
        # Format data for the prompt (last 30 candles is usually good for short-term patterns)
        recent_prices = price_history[-30:] if len(price_history) >= 30 else price_history
        price_str = "\n".join([f"{p['time']}: Open {p['open']}, High {p['high']}, Low {p['low']}, Close {p['close']}" for p in recent_prices])
        
        prompt = f"""
        Analyze the following OHLCV price data for {symbol} and identify any significant technical chart patterns.
        Look for patterns like: Head and Shoulders, Double Top/Bottom, Bull/Bear Flags, Triangles, Wedges, or Candlestick patterns (Doji, Hammer, Engulfing).
        
        Price Data:
        {price_str}
        
        Return a JSON list of detected patterns. If no clear patterns are found, return an empty list.
        Format:
        [
            {{
                "name": "Pattern Name",
                "type": "Bullish" | "Bearish",
                "description": "Brief explanation.",
                "reliability": "High" | "Medium" | "Low",
                "stop_loss": float (suggested price level),
                "target_price": float (suggested take profit),
                "timeframe": "Daily" | "4h" | "1h" (best fit)
            }}
        ]
        """
        
        import asyncio
        
        try:
            # Try OpenAI first
            if self.openai_client:
                def _openai_call():
                    response = self.openai_client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {"role": "system", "content": "You are a technical analysis expert. Output JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"}
                    )
                    return json.loads(response.choices[0].message.content)
                
                result = await asyncio.to_thread(_openai_call)
                
                # Handle potential wrapper keys like {"patterns": [...]}
                if isinstance(result, dict) and "patterns" in result:
                    return result["patterns"]
                return result if isinstance(result, list) else []

            # Fallback to Gemini
            elif self.gemini_key:
                def _gemini_call():
                    response = self.gemini_model.generate_content(prompt)
                    text = response.text.replace("```json", "").replace("```", "").strip()
                    return json.loads(text)
                    
                result = await asyncio.to_thread(_gemini_call)
                
                if isinstance(result, dict) and "patterns" in result:
                    return result["patterns"]
                return result if isinstance(result, list) else []
                
        except Exception as e:
            logger.error(f"LLM Pattern detection failed: {e}")
            return []
        
        return []

llm_service = LLMService()
