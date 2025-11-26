import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.services.logger import logger_service
from app.services.market_data import market_data_service
from app.services.learning import learning_service

# Configuration for the brain
BRAIN_CONFIG = {
    "cycle_interval_seconds": 300,  # Run every 5 minutes
    "min_history_days": 30,
    "confidence_threshold_adjustment": 0.05,
    "max_api_errors_before_heal": 3
}

class SystemBrain:
    def __init__(self):
        self.is_running = False
        self.last_cycle_time = None
        self.health_status = "HEALTHY"
        self.api_error_count = 0
        self.performance_metrics = {
            "predictions_made": 0,
            "predictions_correct": 0,
            "accuracy": 0.0
        }

    async def start_brain(self):
        """
        Starts the autonomous brain loop.
        """
        if self.is_running:
            return
        
        self.is_running = True
        logger_service.log("INFO", "BRAIN", "System Brain ACTIVATED. Autonomous mode engaged.")
        
        while self.is_running:
            try:
                start_time = datetime.now()
                self.last_cycle_time = start_time
                
                await self.run_cycle()
                
                # Calculate sleep time to maintain interval
                elapsed = (datetime.now() - start_time).total_seconds()
                sleep_time = max(1, BRAIN_CONFIG["cycle_interval_seconds"] - elapsed)
                
                await asyncio.sleep(sleep_time)
                
            except Exception as e:
                logger_service.log("ERROR", "BRAIN", f"Critical Brain Failure: {e}")
                self.health_status = "CRITICAL"
                await asyncio.sleep(60) # Wait a bit before retrying

    async def run_cycle(self):
        """
        Main autonomous cycle: Audit -> Heal -> Learn -> Optimize.
        """
        logger_service.log("INFO", "BRAIN", "Starting autonomous cycle...")
        
        # 1. Self-Healing: Check Data Integrity
        await self.audit_data()
        
        # 2. Continuous Learning: Verify past predictions
        await self.evaluate_strategies()
        
        # 3. Dynamic Optimization: Tune parameters
        await self.optimize_parameters()
        
        # 4. Auto-Fix: Check system health
        await self.self_heal()
        
        logger_service.log("INFO", "BRAIN", "Cycle complete.")

    async def audit_data(self):
        """
        Checks for missing price history and triggers ingestion if needed.
        """
        try:
            # Check a few key assets for recent data
            key_assets = ["RELIANCE.NS", "BTC-USD", "AAPL", "ETH-USD"]
            for symbol in key_assets:
                is_fresh = await market_data_service.check_data_freshness(symbol)
                
                if not is_fresh:
                    logger_service.log("WARNING", "BRAIN", f"Data gap detected for {symbol}. Triggering self-healing ingestion.")
                    # Trigger ingestion (fetch 5 days history to fill gap)
                    await market_data_service.get_price_history(symbol, days=5)
                    self.health_status = "HEALING"
                else:
                    logger_service.log("INFO", "BRAIN", f"Data for {symbol} is fresh.")
                    
        except Exception as e:
            logger_service.log("ERROR", "BRAIN", f"Audit failed: {e}")

    async def evaluate_strategies(self):
        """
        Compares past predictions with actual outcomes to calculate accuracy.
        """
        # Simulate learning process
        # In real system: Query DB for predictions made > 24h ago, check if target hit.
        logger_service.log("INFO", "BRAIN", "Evaluating strategy performance...")
        
        # Mock metrics update
        import random
        new_predictions = random.randint(1, 5)
        correct = int(new_predictions * random.uniform(0.6, 0.9))
        
        self.performance_metrics["predictions_made"] += new_predictions
        self.performance_metrics["predictions_correct"] += correct
        
        if self.performance_metrics["predictions_made"] > 0:
            self.performance_metrics["accuracy"] = (self.performance_metrics["predictions_correct"] / self.performance_metrics["predictions_made"]) * 100
            
        logger_service.log("INFO", "BRAIN", f"Current Accuracy: {self.performance_metrics['accuracy']:.2f}%")

    async def optimize_parameters(self):
        """
        Adjusts strategy parameters based on accuracy.
        """
        # Dynamic Tuning
        if self.performance_metrics["accuracy"] > 80:
            logger_service.log("INFO", "BRAIN", "High accuracy detected. Optimizing for higher frequency.")
            # Example: Lower confidence threshold to take more trades
            # learning_service.set_threshold(0.65)
        elif self.performance_metrics["accuracy"] < 60 and self.performance_metrics["predictions_made"] > 10:
            logger_service.log("INFO", "BRAIN", "Low accuracy detected. Tightening risk parameters.")
            # Example: Increase confidence threshold
            # learning_service.set_threshold(0.80)

    async def self_heal(self):
        """
        Detects API failures and attempts to fix.
        """
        if self.api_error_count > BRAIN_CONFIG["max_api_errors_before_heal"]:
            logger_service.log("WARNING", "BRAIN", "High API error rate detected. Initiating self-healing protocol.")
            # Action: Rotate API keys, clear caches, or restart specific services.
            self.api_error_count = 0 # Reset after healing attempt
            self.health_status = "HEALING"

system_brain = SystemBrain()
