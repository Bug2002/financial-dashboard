from typing import Dict, Any, List

class TalebGuardrails:
    """
    Implements Nassim Taleb's risk principles ("Fooled by Randomness", "The Black Swan", "Antifragile").
    Focuses on "Survival", "Anti-fragility", and avoiding "Blow-ups" (Tail Risk).
    
    Key Checks:
    1. Fragility Detector: High Debt + High Volatility = Fragile.
    2. "Skin in the Game": Insider ownership/buying is a must.
    3. Barbell Strategy: Avoid "middle risk". Prefer super safe (Cash) + super risky (Moonshots).
    4. Black Swan Protection: Avoid assets with undefined downside (e.g., short selling, unlimited liability).
    """

    def evaluate(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates an asset's fragility and risk profile.
        Returns a "Fragility Score" (Lower is better/safer).
        """
        fragility_score = 0
        details = []
        
        # Extract metrics (Mock data)
        debt_to_equity = asset_data.get("debt_to_equity", 0.5)
        beta = asset_data.get("beta", 1.0) # Volatility relative to market
        insider_ownership = asset_data.get("insider_ownership", 10.0) # Percentage
        max_drawdown = asset_data.get("max_drawdown", -20.0) # Worst historical drop %

        # 1. Fragility Detector (Debt + Volatility)
        if debt_to_equity > 1.0 and beta > 1.5:
            fragility_score += 40
            details.append("DANGER: High Debt + High Volatility. Extremely Fragile.")
        elif debt_to_equity > 1.5:
            fragility_score += 20
            details.append("WARNING: Excessive Debt. Vulnerable to shocks.")
        else:
            details.append("PASS: Debt levels allow for survival.")

        # 2. Skin in the Game
        if insider_ownership > 15:
            details.append("PASS: High Insider Ownership. Management has Skin in the Game.")
        elif insider_ownership < 1:
            fragility_score += 10
            details.append("WARNING: No Insider Ownership. Agency problem risk.")
        else:
            details.append("NEUTRAL: Moderate Insider Ownership.")

        # 3. Historical "Blow-up" Risk (Max Drawdown)
        if max_drawdown < -50:
            fragility_score += 20
            details.append(f"CAUTION: History of massive drawdowns ({max_drawdown}%). 'Turkey' risk.")
        elif max_drawdown > -15:
            details.append("PASS: Asset has shown resilience in downturns.")

        # 4. Complexity Risk (Mock check for 'complex' derivatives or opaque business)
        # In a real app, this might check the sector or asset type
        is_complex = False 
        if is_complex:
            fragility_score += 30
            details.append("DANGER: Asset is complex/opaque. 'If you don't understand it, it's fragile'.")

        # Final Assessment
        status = "Antifragile" if fragility_score < 10 else "Robust" if fragility_score < 30 else "Fragile"
        
        return {
            "score": 100 - fragility_score, # Convert to a "Safety Score" (0-100)
            "status": status,
            "details": details,
            "metrics": {
                "fragility_score": fragility_score,
                "beta": beta,
                "max_drawdown": max_drawdown
            }
        }

taleb_strategy = TalebGuardrails()
