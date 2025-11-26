from typing import Dict, Any, List

class LynchStrategy:
    """
    Implements Peter Lynch's investment principles ("One Up On Wall Street").
    Focuses on "Growth at a Reasonable Price" (GARP).
    
    Key Metrics:
    1. PEG Ratio (Price/Earnings to Growth): < 1.0 is good, < 0.5 is amazing.
    2. Earnings Growth: 15-25% is the "sweet spot" (fast growers).
    3. Debt/Equity: Low debt is crucial.
    4. Institutional Ownership: Lower is better (finding hidden gems before Wall St).
    """

    def evaluate(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates an asset based on Lynch's criteria.
        Returns a score (0-100) and detailed analysis.
        """
        score = 0
        details = []
        
        # Extract metrics (Mock data for now, will connect to real API later)
        # In a real scenario, these would come from the 'fundamentals' key in asset_data
        pe_ratio = asset_data.get("pe_ratio", 20.0)
        earnings_growth = asset_data.get("earnings_growth", 15.0) # Percentage
        dividend_yield = asset_data.get("dividend_yield", 1.0) # Percentage
        debt_to_equity = asset_data.get("debt_to_equity", 0.5)
        institutional_ownership = asset_data.get("institutional_ownership", 40.0) # Percentage

        # 1. PEG Ratio Calculation (Lynch's Holy Grail)
        # Formula: P/E / Growth Rate (or (P/E) / (Growth + Yield) for dividend payers)
        adjusted_growth = earnings_growth + dividend_yield
        peg_ratio = pe_ratio / adjusted_growth if adjusted_growth > 0 else 10.0
        
        if peg_ratio < 0.5:
            score += 40
            details.append(f"PASS: PEG Ratio ({peg_ratio:.2f}) is excellent (< 0.5). A potential multi-bagger.")
        elif peg_ratio < 1.0:
            score += 30
            details.append(f"PASS: PEG Ratio ({peg_ratio:.2f}) is good (< 1.0). Undervalued relative to growth.")
        elif peg_ratio < 1.5:
            score += 15
            details.append(f"NEUTRAL: PEG Ratio ({peg_ratio:.2f}) is fair.")
        else:
            details.append(f"FAIL: PEG Ratio ({peg_ratio:.2f}) is high. Growth is expensive.")

        # 2. Earnings Growth "Sweet Spot"
        if 20 <= earnings_growth <= 25:
            score += 20
            details.append(f"PASS: Earnings Growth ({earnings_growth}%) is in the Lynch 'sweet spot' (20-25%).")
        elif 10 <= earnings_growth < 20:
            score += 15
            details.append(f"PASS: Earnings Growth ({earnings_growth}%) is solid.")
        elif earnings_growth > 30:
            score += 5
            details.append(f"CAUTION: Earnings Growth ({earnings_growth}%) is very high. Sustainable?")
        else:
            details.append(f"FAIL: Earnings Growth ({earnings_growth}%) is sluggish.")

        # 3. Low Debt
        if debt_to_equity < 0.3:
            score += 20
            details.append(f"PASS: Debt/Equity ({debt_to_equity}) is very low. Strong balance sheet.")
        elif debt_to_equity < 0.8:
            score += 10
            details.append(f"PASS: Debt/Equity ({debt_to_equity}) is manageable.")
        else:
            details.append(f"FAIL: Debt/Equity ({debt_to_equity}) is high.")

        # 4. Institutional Ownership (Contrarian Indicator)
        if institutional_ownership < 30:
            score += 20
            details.append(f"PASS: Institutional Ownership ({institutional_ownership}%) is low. A potential 'undiscovered' gem.")
        elif institutional_ownership < 60:
            score += 10
            details.append(f"NEUTRAL: Institutional Ownership ({institutional_ownership}%) is moderate.")
        else:
            details.append(f"NOTE: Institutional Ownership ({institutional_ownership}%) is high. Wall St already knows this one.")

        # Final Rating
        rating = "Buy" if score >= 80 else "Hold" if score >= 50 else "Avoid"
        category = "Fast Grower" if earnings_growth > 20 else "Stalwart" if earnings_growth > 10 else "Slow Grower"

        return {
            "score": score,
            "rating": rating,
            "category": category,
            "details": details,
            "metrics": {
                "peg_ratio": round(peg_ratio, 2),
                "earnings_growth": earnings_growth,
                "debt_to_equity": debt_to_equity,
                "institutional_ownership": institutional_ownership
            }
        }

lynch_strategy = LynchStrategy()
