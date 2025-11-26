import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

DATA_FILE = "data/ai_memory.json"

class LearningService:
    def __init__(self):
        self._ensure_data_dir()
        self.memory = self._load_memory()

    def _ensure_data_dir(self):
        if not os.path.exists("data"):
            os.makedirs("data")
        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, "w") as f:
                json.dump({"predictions": [], "patterns": []}, f)

    def _load_memory(self) -> Dict[str, List[Any]]:
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {"predictions": [], "patterns": []}

    def _save_memory(self):
        with open(DATA_FILE, "w") as f:
            json.dump(self.memory, f, indent=2)

    def save_prediction(self, symbol: str, prediction: Dict[str, Any]):
        """Saves a new prediction to memory."""
        record = {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "predicted_signal": prediction.get("signal"),
            "predicted_price": prediction.get("predicted_price"),
            "current_price": prediction.get("current_price"),
            "horizon_days": prediction.get("horizon_days", 7),
            "reasoning": prediction.get("reasoning"),
            "validated": False,
            "outcome": None
        }
        self.memory["predictions"].append(record)
        self._save_memory()

    def validate_predictions(self, symbol: str, current_price: float):
        """Checks past predictions against current price to see if they were right."""
        updated = False
        for pred in self.memory["predictions"]:
            if pred["symbol"] == symbol and not pred["validated"]:
                # Check if enough time has passed or if price hit target
                pred_time = datetime.fromisoformat(pred["timestamp"])
                # Check if enough time has passed or if price hit target
                pred_time = datetime.fromisoformat(pred["timestamp"])
                # DEMO MODE: Validate after 1 minute instead of 1 day
                if (datetime.now() - pred_time).total_seconds() >= 60:
                    
                    # Determine if correct
                    start_price = pred["current_price"]
                    signal = pred["predicted_signal"]
                    
                    is_correct = False
                    if signal == "Buy" and current_price > start_price:
                        is_correct = True
                    elif signal == "Sell" and current_price < start_price:
                        is_correct = True
                    elif signal == "Neutral":
                        # Neutral is correct if price didn't move much (e.g., < 1%)
                        change_pct = abs((current_price - start_price) / start_price)
                        if change_pct < 0.01:
                            is_correct = True

                    pred["validated"] = True
                    pred["outcome"] = "Correct" if is_correct else "Incorrect"
                    pred["actual_price"] = current_price
                    updated = True
        
        if updated:
            self._save_memory()

    def get_learning_context(self, symbol: str) -> str:
        """Returns a summary of past performance for the LLM."""
        symbol_preds = [p for p in self.memory["predictions"] if p["symbol"] == symbol and p["validated"]]
        
        if not symbol_preds:
            return "No past performance data available for this asset."

        correct = len([p for p in symbol_preds if p["outcome"] == "Correct"])
        total = len(symbol_preds)
        symbol_preds = [p for p in self.memory["predictions"] if p["symbol"] == symbol and p["validated"]]
        if not symbol_preds:
            return 0.0
        correct = len([p for p in symbol_preds if p["outcome"] == "Correct"])
        return round((correct / len(symbol_preds)) * 100, 1)

    def save_pattern_event(self, symbol: str, pattern: Dict[str, Any]):
        """Saves a detected pattern for future validation."""
        # Avoid duplicates: check if same pattern name exists for this symbol today
        today = datetime.now().date().isoformat()
        existing = [p for p in self.memory["patterns"] if p["symbol"] == symbol and p["name"] == pattern["name"] and p["timestamp"].startswith(today)]
        if existing:
            return

        record = {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "name": pattern["name"],
            "type": pattern["type"],
            "entry_price": pattern.get("entry_price", 0), # Needs to be passed or inferred
            "target_price": pattern.get("target_price"),
            "stop_loss": pattern.get("stop_loss"),
            "validated": False,
            "outcome": None
        }
        self.memory["patterns"].append(record)
        self._save_memory()

    def validate_patterns(self, symbol: str, current_price: float):
        """Checks if past patterns hit their targets."""
        updated = False
        for pat in self.memory["patterns"]:
            if pat["symbol"] == symbol and not pat["validated"]:
                # logic: if Bullish, did it hit target before stop loss?
                if pat["target_price"] and pat["stop_loss"]:
                    if pat["type"] == "Bullish":
                        if current_price >= pat["target_price"]:
                            pat["validated"] = True
                            pat["outcome"] = "Success"
                            updated = True
                        elif current_price <= pat["stop_loss"]:
                            pat["validated"] = True
                            pat["outcome"] = "Failure"
                            updated = True
                    elif pat["type"] == "Bearish":
                        if current_price <= pat["target_price"]:
                            pat["validated"] = True
                            pat["outcome"] = "Success"
                            updated = True
                        elif current_price >= pat["stop_loss"]:
                            pat["validated"] = True
                            pat["outcome"] = "Failure"
                            updated = True
        
        if updated:
            self._save_memory()

    def get_pattern_performance(self, pattern_name: str = None) -> Dict[str, Any]:
        """Returns stats for a specific pattern or all patterns."""
        patterns = self.memory["patterns"]
        if pattern_name:
            patterns = [p for p in patterns if p["name"] == pattern_name]
        
        validated = [p for p in patterns if p["validated"]]
        if not validated:
            return {"total": 0, "success_rate": 0}
            
        success = len([p for p in validated if p["outcome"] == "Success"])
        return {
            "total": len(validated),
            "success_rate": round((success / len(validated)) * 100, 1)
        }

    def get_recent_patterns(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns the most recent detected patterns."""
        # Sort by timestamp descending
        patterns = sorted(self.memory["patterns"], key=lambda x: x["timestamp"], reverse=True)
        return patterns[:limit]

    def get_accuracy_score(self, symbol: str = None) -> float:
        """Returns the accuracy score for a specific symbol or overall."""
        preds = self.memory["predictions"]
        if symbol:
            preds = [p for p in preds if p["symbol"] == symbol]
        
        validated = [p for p in preds if p["validated"]]
        if not validated:
            return 0.0
            
        correct = len([p for p in validated if p["outcome"] == "Correct"])
        return round((correct / len(validated)) * 100, 1)

    def get_brain_status(self) -> Dict[str, Any]:
        """Returns the current status of the AI brain."""
        # Calculate overall accuracy
        total_preds = len([p for p in self.memory["predictions"] if p["validated"]])
        correct_preds = len([p for p in self.memory["predictions"] if p["validated"] and p["outcome"] == "Correct"])
        accuracy = round((correct_preds / total_preds * 100), 1) if total_preds > 0 else 0

        # Get recent lessons (last 5 validated predictions)
        recent_lessons = []
        for p in sorted(self.memory["predictions"], key=lambda x: x["timestamp"], reverse=True):
            if p["validated"]:
                lesson = f"I predicted {p['symbol']} would {p['predicted_signal']}, and it was {p['outcome']}."
                recent_lessons.append(lesson)
            if len(recent_lessons) >= 5:
                break

        return {
            "status": "Active",
            "accuracy": accuracy,
            "total_predictions": len(self.memory["predictions"]),
            "lessons": recent_lessons,
            "parameters": {
                "RSI_THRESHOLD": 30, # Mock for now, would come from config
                "CONFIDENCE_MIN": 0.65,
                "LEARNING_RATE": "Adaptive"
            }
        }

learning_service = LearningService()
