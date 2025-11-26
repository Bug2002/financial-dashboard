from typing import Dict, Any, List

class HouselCheck:
    """
    Implements Morgan Housel's psychology principles ("The Psychology of Money").
    Focuses on Behavior, Patience, and "Enough".
    
    Key Checks:
    1. FOMO Detector: High RSI + High Valuation = Chasing hype.
    2. Patience Check: Encourages "Time in the Market" over "Timing the Market".
    3. "Sleep at Night": Checks if volatility aligns with a "peaceful" portfolio.
    4. "Enough": Reminds to take profits if gains are excessive (Mock).
    """

    def evaluate(self, asset_data: Dict[str, Any], technicals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates the psychological aspect of a trade.
        Returns a "Psychology Score" (Higher is better/calmer).
        """
        psych_score = 100
        details = []
        
        # Extract metrics
        rsi = technicals.get("rsi", 50.0)
        pe_ratio = asset_data.get("pe_ratio", 20.0)
        volatility = asset_data.get("beta", 1.0)
        recent_gain = asset_data.get("recent_gain_pct", 5.0) # Mock

        # 1. FOMO Detector
        if rsi > 75 and pe_ratio > 50:
            psych_score -= 40
            details.append("FOMO ALERT: Buying high valuation at peak momentum. Are you chasing hype?")
        elif rsi > 80:
            psych_score -= 20
            details.append("CAUTION: Asset is overheated. Don't let greed drive you.")

        # 2. "Sleep at Night" Test (Volatility)
        if volatility > 2.0:
            psych_score -= 10
            details.append("NOTE: High volatility. Will you panic sell if this drops 20% tomorrow?")
        
        # 3. "Enough" (Profit Taking)
        if recent_gain > 50:
            details.append("REMINDER: You're up 50%. Remember 'Enough'. Consider taking some chips off the table.")

        # 4. Long-term Mindset
        details.append("WISDOM: 'Compounding is the eighth wonder of the world.' Think decades, not days.")

        # Final Assessment
        mindset = "Zen" if psych_score >= 80 else "Anxious" if psych_score >= 50 else "Reckless"

        return {
            "score": psych_score,
            "mindset": mindset,
            "details": details,
            "metrics": {
                "fomo_risk": "High" if psych_score < 60 else "Low",
                "rsi": rsi
            }
        }

housel_strategy = HouselCheck()
