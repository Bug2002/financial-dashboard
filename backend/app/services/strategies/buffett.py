from typing import Dict, Any, List

class BuffettStrategy:
    """
    Implements Warren Buffett's investment principles ("The Warren Buffett Way").
    Focuses on "Quality at a Fair Price", Moats, and Management Competence.
    
    Key Metrics:
    1. Return on Equity (ROE): > 15% consistently indicates a moat.
    2. Gross Margin: High margins (> 40%) suggest pricing power (Moat).
    3. Debt/Equity: Low debt (< 0.5) ensures survival.
    4. Free Cash Flow (FCF): Positive and growing.
    """

    def evaluate(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates an asset based on Buffett's criteria.
        Returns a score (0-100) and detailed analysis.
        """
        score = 0
        details = []
        
        # Extract metrics (Mock data for now)
        roe = asset_data.get("roe", 20.0) # Percentage
        gross_margin = asset_data.get("gross_margin", 50.0) # Percentage
        debt_to_equity = asset_data.get("debt_to_equity", 0.5)
        fcf_yield = asset_data.get("fcf_yield", 5.0) # Percentage

        # 1. Return on Equity (The Moat Indicator)
        if roe > 20:
            score += 30
            details.append(f"PASS: ROE ({roe}%) is excellent (> 20%). Strong competitive advantage.")
        elif roe > 15:
            score += 20
            details.append(f"PASS: ROE ({roe}%) is good (> 15%).")
        elif roe > 10:
            score += 10
            details.append(f"NEUTRAL: ROE ({roe}%) is average.")
        else:
            details.append(f"FAIL: ROE ({roe}%) is low. No clear moat.")

        # 2. Gross Margin (Pricing Power)
        if gross_margin > 60:
            score += 25
            details.append(f"PASS: Gross Margin ({gross_margin}%) is world-class. Huge pricing power.")
        elif gross_margin > 40:
            score += 15
            details.append(f"PASS: Gross Margin ({gross_margin}%) is healthy.")
        elif gross_margin > 20:
            score += 5
            details.append(f"NEUTRAL: Gross Margin ({gross_margin}%) is okay.")
        else:
            details.append(f"FAIL: Gross Margin ({gross_margin}%) is thin. Commodity business?")

        # 3. Low Debt (Safety)
        if debt_to_equity < 0.3:
            score += 25
            details.append(f"PASS: Debt/Equity ({debt_to_equity}) is minimal. Very safe.")
        elif debt_to_equity < 0.5:
            score += 15
            details.append(f"PASS: Debt/Equity ({debt_to_equity}) is conservative.")
        else:
            details.append(f"FAIL: Debt/Equity ({debt_to_equity}) is high. Buffett dislikes leverage.")

        # 4. Free Cash Flow (Owner Earnings)
        if fcf_yield > 5:
            score += 20
            details.append(f"PASS: FCF Yield ({fcf_yield}%) is attractive.")
        elif fcf_yield > 0:
            score += 10
            details.append(f"PASS: FCF is positive.")
        else:
            details.append(f"FAIL: FCF is negative. Cash burner.")

        # Final Rating
        rating = "Buy" if score >= 85 else "Hold" if score >= 55 else "Avoid"
        quality = "Wide Moat" if score >= 80 else "Narrow Moat" if score >= 50 else "No Moat"

        return {
            "score": score,
            "rating": rating,
            "quality": quality,
            "details": details,
            "metrics": {
                "roe": roe,
                "gross_margin": gross_margin,
                "debt_to_equity": debt_to_equity,
                "fcf_yield": fcf_yield
            }
        }

buffett_strategy = BuffettStrategy()
