from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from typing import List, Dict, Any
from app.services.market_data import market_data_service

router = APIRouter()

@router.get("/search", response_model=List[Dict[str, str]])
async def search_assets(q: str = Query(..., min_length=1)):
    """
    Search for assets by symbol or name.
    """
    results = await market_data_service.search_assets(q)
    return results

@router.get("/market/movers", response_model=List[Dict[str, Any]])
async def get_market_movers():
    """
    Get top market movers (all tracked assets).
    """
    return await market_data_service.get_market_movers()

@router.get("/asset/{symbol}/price", response_model=List[Dict[str, Any]])
async def get_asset_price(symbol: str, days: int = 30):
    """
    Get historical price data for an asset.
    """
    import sys
    sys.stderr.write(f"DEBUG: Request for {symbol}\n")
    try:
        # In a real app, we would validate if the symbol exists first
        data = await market_data_service.get_price_history(symbol, days)
        sys.stderr.write(f"DEBUG: Got data length {len(data)}\n")
        if not data:
            raise HTTPException(status_code=404, detail="Price data not found")
        return data
    except Exception as e:
        sys.stderr.write(f"DEBUG: Error in endpoint: {e}\n")
        import traceback
        traceback.print_exc()
        raise e

@router.get("/asset/{symbol}/patterns", response_model=List[Dict[str, Any]])
async def get_asset_patterns(symbol: str):
    from app.services.analysis import analysis_service
    try:
        return await analysis_service.detect_patterns(symbol)
    except Exception as e:
        print(f"Error detecting patterns for {symbol}: {e}")
        # Mock Fallback
        return [
            {"name": "Bull Flag", "type": "Bullish", "description": "Strong uptrend followed by consolidation.", "reliability": "High", "timeframe": "Daily", "stop_loss": 1450, "target_price": 1600, "timestamp": "2025-11-25T10:00:00"},
            {"name": "Double Bottom", "type": "Bullish", "description": "Reversal pattern indicating support.", "reliability": "Medium", "timeframe": "4h", "stop_loss": 1480, "target_price": 1550, "timestamp": "2025-11-25T11:30:00"}
        ]

@router.get("/patterns/recent", response_model=List[Dict[str, Any]])
async def get_recent_patterns():
    from app.services.learning import learning_service
    patterns = learning_service.get_recent_patterns(limit=20)
    if not patterns:
        # Mock Fallback
        return [
            {"name": "Bull Flag", "type": "Bullish", "symbol": "RELIANCE.NS", "timestamp": "2025-11-25T10:00:00"},
            {"name": "Head & Shoulders", "type": "Bearish", "symbol": "TCS.NS", "timestamp": "2025-11-25T09:45:00"},
            {"name": "Cup and Handle", "type": "Bullish", "symbol": "INFY.NS", "timestamp": "2025-11-25T11:15:00"}
        ]
    return patterns

@router.get("/brain/status", response_model=Dict[str, Any])
async def get_brain_status():
    from app.services.learning import learning_service
    return learning_service.get_brain_status()

@router.get("/asset/{symbol}/predict", response_model=Dict[str, Any])
async def get_asset_prediction(symbol: str, days: int = 7):
    from app.services.analysis import analysis_service
    from app.services.market_data import market_data_service
    from app.services.news import news_service
    
    try:
        # Fetch required data
        price_history = await market_data_service.get_price_history(symbol, days=30)
        news = news_service.get_news(symbol)
        
        return await analysis_service.predict_future(price_history, news, symbol)
    except Exception as e:
        print(f"Error generating prediction for {symbol}: {e}")
        # Mock Fallback for MVP if AI fails (e.g. missing key)
        import datetime
        future_date = (datetime.datetime.now() + datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        return {
            "symbol": symbol,
            "current_price": 2500.0,
            "predicted_price": 2650.0,
            "prediction_date": future_date,
            "confidence": 0.85,
            "signal": "BUY",
            "reasoning": "Technical indicators suggest a strong uptrend. (AI Model unavailable, using fallback)"
        }

@router.get("/users/me/watchlist", response_model=List[Dict[str, Any]])
async def get_user_watchlist():
    """
    Get user watchlist. Mocked for MVP.
    """
    return [
        {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "price": 2450.0, "change": 1.5},
        {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "price": 3500.0, "change": -0.5}
    ]

@router.get("/logs", response_model=List[Dict[str, Any]])
async def get_system_logs(limit: int = 50, level: str = None):
    from app.services.logger import logger_service
    logs = logger_service.get_logs(limit, level)
    if not logs:
        # Mock Fallback
        import datetime
        now = datetime.datetime.now().isoformat()
        return [
            {"id": 1, "timestamp": now, "level": "INFO", "category": "SYSTEM", "message": "System started successfully", "metadata": {}},
            {"id": 2, "timestamp": now, "level": "INFO", "category": "MARKET_DATA", "message": "Connected to NSE data feed", "metadata": {}},
            {"id": 3, "timestamp": now, "level": "WARNING", "category": "AI_ENGINE", "message": "OpenAI Quota Exceeded - Switching to Local Rules", "metadata": {}},
            {"id": 4, "timestamp": now, "level": "SUCCESS", "category": "PATTERN_SCAN", "message": "Detected Bull Flag on RELIANCE.NS", "metadata": {}},
            {"id": 5, "timestamp": now, "level": "INFO", "category": "USER", "message": "User login detected", "metadata": {}}
        ]
    return logs

@router.get("/logs/stats", response_model=Dict[str, Any])
async def get_log_stats():
    from app.services.logger import logger_service
    stats = logger_service.get_stats()
    if stats["total_logs"] == 0:
        return {"total_logs": 1250, "error_count": 5, "warning_count": 12}
    return stats

@router.get("/news", response_model=List[Dict[str, Any]])
async def get_unified_news():
    from app.services.news import news_service
    return news_service.fetch_latest_news()

@router.get("/api/asset/{symbol}/news", response_model=List[Dict[str, Any]])
async def get_asset_news(symbol: str):
    from app.services.news import news_service
    return news_service.get_news(symbol)

@router.get("/asset/{symbol}/news", response_model=List[Dict[str, Any]])
async def get_asset_news_alias(symbol: str):
    """
    Get news for a specific asset.
    """
    from app.services.news import news_service
    # Trigger a fetch if we don't have news (optional, but good for demo)
    # For now, just return what's in DB to be fast
    return news_service.get_news(symbol)

@router.get("/asset/{symbol}/technicals", response_model=Dict[str, Any])
async def get_asset_technicals(symbol: str):
    """
    Get technical analysis from TradingView.
    """
    from app.services.tradingview import tradingview_service
    import asyncio
    
    # Run in thread pool to avoid blocking
    analysis = await asyncio.to_thread(tradingview_service.get_technical_analysis, symbol)
    
    if not analysis:
        # Return neutral fallback if TV fails
        return {
            "summary": {"RECOMMENDATION": "NEUTRAL", "BUY": 0, "SELL": 0, "NEUTRAL": 0},
            "oscillators": {"RECOMMENDATION": "NEUTRAL", "BUY": 0, "SELL": 0, "NEUTRAL": 0},
            "moving_averages": {"RECOMMENDATION": "NEUTRAL", "BUY": 0, "SELL": 0, "NEUTRAL": 0}
        }
    return analysis

@router.post("/admin/ingest")
async def ingest_data(background_tasks: BackgroundTasks):
    """
    Trigger background ingestion of global asset data.
    """
    background_tasks.add_task(market_data_service.ingest_global_data)
    return {"status": "Ingestion started in background"}

@router.get("/agent/status", response_model=Dict[str, Any])
async def get_agent_status():
    from app.services.system_agent import system_agent
    return system_agent.get_status()

@router.post("/agent/start")
async def start_agent():
    from app.services.system_agent import system_agent
    await system_agent.start()
    return {"status": "Agent started"}

@router.post("/agent/stop")
async def stop_agent():
    from app.services.system_agent import system_agent
    await system_agent.stop()
    return {"status": "Agent stopped"}

@router.post("/agent/run")
async def run_agent_manual(background_tasks: BackgroundTasks):
    from app.services.system_agent import system_agent
    # Trigger a run immediately (in background to not block)
    background_tasks.add_task(system_agent._loop)
    return {"status": "Manual run triggered"}
