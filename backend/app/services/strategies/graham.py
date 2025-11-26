from typing import Dict, Any

class GrahamStrategy:
    """
    Implements Benjamin Graham's Value Investing principles.
    Source: 'The Intelligent Investor'
    """

    def evaluate(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates an asset based on Graham's criteria.
        Returns a score (0-100) and a breakdown of the analysis.
        """
        score = 0
        max_score = 5 # We have 5 main criteria
        details = []

        # Extract metrics (mocking some if not available for now)
        # In a real scenario, these would come from a fundamental data provider API
        pe_ratio = asset_data.get("pe_ratio", 20.0) # Default to "expensive" if unknown
        pb_ratio = asset_data.get("pb_ratio", 2.0)
        current_ratio = asset_data.get("current_ratio", 1.5)
        debt_to_equity = asset_data.get("debt_to_equity", 0.8)
        earnings_growth = asset_data.get("earnings_growth", 0.05) # 5% growth

        # Criterion 1: Moderate P/E Ratio (< 15)
        if pe_ratio < 15:
            score += 1
            details.append(f"PASS: P/E Ratio ({pe_ratio}) is below 15.")
        else:
            details.append(f"FAIL: P/E Ratio ({pe_ratio}) is too high (Target < 15).")

        # Criterion 2: Moderate P/B Ratio (< 1.5)
        # Note: Graham also allowed P/E * P/B < 22.5. We'll stick to the simpler rule for now.
        if pb_ratio < 1.5:
            score += 1
            details.append(f"PASS: P/B Ratio ({pb_ratio}) is below 1.5.")
        else:
            details.append(f"FAIL: P/B Ratio ({pb_ratio}) is too high (Target < 1.5).")

        # Criterion 3: Financial Strength (Current Ratio > 2.0)
        if current_ratio > 2.0:
            score += 1
            details.append(f"PASS: Current Ratio ({current_ratio}) indicates strong liquidity.")
        else:
            details.append(f"FAIL: Current Ratio ({current_ratio}) is weak (Target > 2.0).")

        # Criterion 4: Conservative Debt (Total Debt < Equity)
        if debt_to_equity < 0.5:
            score += 1
            details.append(f"PASS: Debt/Equity ({debt_to_equity}) is conservative.")
        else:
            details.append(f"FAIL: Debt/Equity ({debt_to_equity}) is high (Target < 0.5).")

        # Criterion 5: Earnings Stability/Growth (Positive growth)
        if earnings_growth > 0:
            score += 1
            details.append(f"PASS: Earnings Growth ({earnings_growth*100}%) is positive.")
        else:
            details.append(f"FAIL: Earnings Growth is negative.")

        # Calculate final normalized score (0-100)
        final_score = (score / max_score) * 100

        return {
            "score": final_score,
            "rating": "Undervalued" if final_score >= 80 else "Fair Value" if final_score >= 40 else "Overvalued",
            "details": details,
            "metrics": {
                "pe_ratio": pe_ratio,
                "pb_ratio": pb_ratio,
                "current_ratio": current_ratio,
                "debt_to_equity": debt_to_equity
            }
        }

graham_strategy = GrahamStrategy()
