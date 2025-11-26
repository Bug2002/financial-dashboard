from fastapi import APIRouter, HTTPException, Query, Depends
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
    """
    Detect technical patterns for an asset.
    """
    # Fetch price history first
    price_history = await market_data_service.get_price_history(symbol, days=60)
    if not price_history:
        raise HTTPException(status_code=404, detail="Price data not found")
    
    from app.services.analysis import analysis_service
    patterns = analysis_service.detect_patterns(price_history)
    return patterns

@router.get("/asset/{symbol}/predict", response_model=Dict[str, Any])
async def get_asset_prediction(symbol: str, horizon: int = 7):
    """
    Get probabilistic prediction for an asset.
    """
    # Fetch price history first
    price_history = await market_data_service.get_price_history(symbol, days=30)
    if not price_history:
        raise HTTPException(status_code=404, detail="Price data not found")
    
    from app.services.analysis import analysis_service
    prediction = analysis_service.predict_future(price_history, horizon)
    return prediction

@router.get("/asset/{symbol}/news", response_model=List[Dict[str, Any]])
async def get_asset_news(symbol: str):
    """
    Get live news with credibility scores for an asset.
    """
    from app.services.news import news_service
    news = news_service.get_news(symbol)
    return news

from app.api.auth import get_current_user
from app.services.auth import User

@router.get("/users/me/watchlist", response_model=List[str])
async def get_watchlist(current_user: User = Depends(get_current_user)):
    from app.services.auth import auth_service
    return auth_service.get_watchlist(current_user.username)

@router.post("/users/me/watchlist/{symbol}", response_model=List[str])
async def add_to_watchlist(symbol: str, current_user: User = Depends(get_current_user)):
    from app.services.auth import auth_service
    return auth_service.add_to_watchlist(current_user.username, symbol)

@router.delete("/users/me/watchlist/{symbol}", response_model=List[str])
async def remove_from_watchlist(symbol: str, current_user: User = Depends(get_current_user)):
    from app.services.auth import auth_service
    return auth_service.remove_from_watchlist(current_user.username, symbol)
