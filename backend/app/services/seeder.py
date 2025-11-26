from app.services.asset_service import asset_service

MASTER_ASSETS = [
    # 1. Global Stock Indices
    {"symbol": "^NSEI", "name": "NIFTY 50", "type": "Index", "sector": "Global"},
    {"symbol": "^BSESN", "name": "SENSEX", "type": "Index", "sector": "Global"},
    {"symbol": "^NSEBANK", "name": "NIFTY Bank", "type": "Index", "sector": "Global"},
    {"symbol": "^CNXIT", "name": "NIFTY IT", "type": "Index", "sector": "Global"},
    {"symbol": "^GSPC", "name": "S&P 500", "type": "Index", "sector": "Global"},
    {"symbol": "^IXIC", "name": "NASDAQ 100", "type": "Index", "sector": "Global"},
    {"symbol": "^DJI", "name": "Dow Jones Industrial Average", "type": "Index", "sector": "Global"},
    {"symbol": "^FTSE", "name": "FTSE 100", "type": "Index", "sector": "Global"},
    {"symbol": "^GDAXI", "name": "DAX Performance Index", "type": "Index", "sector": "Global"},
    {"symbol": "^HSI", "name": "Hang Seng Index", "type": "Index", "sector": "Global"},
    {"symbol": "^N225", "name": "Nikkei 225", "type": "Index", "sector": "Global"},

    # 2. Major Indian Stocks
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "type": "Stock", "sector": "Energy"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "type": "Stock", "sector": "Technology"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "type": "Stock", "sector": "Financial"},
    {"symbol": "INFY.NS", "name": "Infosys", "type": "Stock", "sector": "Technology"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank", "type": "Stock", "sector": "Financial"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "type": "Stock", "sector": "Financial"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "type": "Stock", "sector": "Financial"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank", "type": "Stock", "sector": "Financial"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel", "type": "Stock", "sector": "Communication"},
    {"symbol": "ITC.NS", "name": "ITC Limited", "type": "Stock", "sector": "Consumer"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "type": "Stock", "sector": "Consumer"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints", "type": "Stock", "sector": "Materials"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance", "type": "Stock", "sector": "Financial"},
    {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv", "type": "Stock", "sector": "Financial"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki", "type": "Stock", "sector": "Auto"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors", "type": "Stock", "sector": "Auto"},
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel", "type": "Stock", "sector": "Materials"},
    {"symbol": "TATAPOWER.NS", "name": "Tata Power", "type": "Stock", "sector": "Utilities"},
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises", "type": "Stock", "sector": "Conglomerate"},
    {"symbol": "ADANIGREEN.NS", "name": "Adani Green Energy", "type": "Stock", "sector": "Utilities"},
    {"symbol": "ADANIPORTS.NS", "name": "Adani Ports", "type": "Stock", "sector": "Infrastructure"},
    {"symbol": "WIPRO.NS", "name": "Wipro", "type": "Stock", "sector": "Technology"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra", "type": "Stock", "sector": "Technology"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro", "type": "Stock", "sector": "Construction"},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement", "type": "Stock", "sector": "Materials"},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India", "type": "Stock", "sector": "Consumer"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation", "type": "Stock", "sector": "Utilities"},
    {"symbol": "NTPC.NS", "name": "NTPC Limited", "type": "Stock", "sector": "Utilities"},
    {"symbol": "COALINDIA.NS", "name": "Coal India", "type": "Stock", "sector": "Energy"},
    {"symbol": "ONGC.NS", "name": "ONGC", "type": "Stock", "sector": "Energy"},

    # 3. Major US Tech Stocks
    {"symbol": "AAPL", "name": "Apple Inc.", "type": "Stock", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Alphabet Inc. (Google)", "type": "Stock", "sector": "Technology"},
    {"symbol": "AMZN", "name": "Amazon.com", "type": "Stock", "sector": "Consumer"},
    {"symbol": "META", "name": "Meta Platforms (Facebook)", "type": "Stock", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corp", "type": "Stock", "sector": "Technology"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "type": "Stock", "sector": "Auto"},
    {"symbol": "NVDA", "name": "NVIDIA Corp", "type": "Stock", "sector": "Technology"},
    {"symbol": "NFLX", "name": "Netflix", "type": "Stock", "sector": "Communication"},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "type": "Stock", "sector": "Technology"},
    {"symbol": "INTC", "name": "Intel Corp", "type": "Stock", "sector": "Technology"},
    {"symbol": "CSCO", "name": "Cisco Systems", "type": "Stock", "sector": "Technology"},
    {"symbol": "ORCL", "name": "Oracle Corp", "type": "Stock", "sector": "Technology"},
    {"symbol": "CRM", "name": "Salesforce", "type": "Stock", "sector": "Technology"},
    {"symbol": "ADBE", "name": "Adobe Inc.", "type": "Stock", "sector": "Technology"},
    {"symbol": "SHOP", "name": "Shopify", "type": "Stock", "sector": "Technology"},
    {"symbol": "UBER", "name": "Uber Technologies", "type": "Stock", "sector": "Technology"},
    {"symbol": "ABNB", "name": "Airbnb", "type": "Stock", "sector": "Consumer"},
    {"symbol": "PYPL", "name": "PayPal Holdings", "type": "Stock", "sector": "Financial"},

    # 4. Top Global Companies
    {"symbol": "KO", "name": "Coca-Cola Company", "type": "Stock", "sector": "Consumer"},
    {"symbol": "PEP", "name": "PepsiCo", "type": "Stock", "sector": "Consumer"},
    {"symbol": "JPM", "name": "JPMorgan Chase", "type": "Stock", "sector": "Financial"},
    {"symbol": "BAC", "name": "Bank of America", "type": "Stock", "sector": "Financial"},
    {"symbol": "MA", "name": "Mastercard", "type": "Stock", "sector": "Financial"},
    {"symbol": "V", "name": "Visa Inc.", "type": "Stock", "sector": "Financial"},
    {"symbol": "WMT", "name": "Walmart", "type": "Stock", "sector": "Consumer"},
    {"symbol": "MCD", "name": "McDonald's", "type": "Stock", "sector": "Consumer"},
    {"symbol": "BA", "name": "Boeing", "type": "Stock", "sector": "Industrial"},
    {"symbol": "XOM", "name": "Exxon Mobil", "type": "Stock", "sector": "Energy"},
    {"symbol": "CVX", "name": "Chevron", "type": "Stock", "sector": "Energy"},
    {"symbol": "TM", "name": "Toyota Motor", "type": "Stock", "sector": "Auto"},
    {"symbol": "005930.KS", "name": "Samsung Electronics", "type": "Stock", "sector": "Technology"}, # Korean ticker
    {"symbol": "SONY", "name": "Sony Group", "type": "Stock", "sector": "Consumer"},

    # 5. Top Cryptocurrencies (Layer-1)
    {"symbol": "BTC-USD", "name": "Bitcoin", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "ETH-USD", "name": "Ethereum", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "BNB-USD", "name": "Binance Coin", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "SOL-USD", "name": "Solana", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "AVAX-USD", "name": "Avalanche", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "ADA-USD", "name": "Cardano", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "DOT-USD", "name": "Polkadot", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "ALGO-USD", "name": "Algorand", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "ATOM-USD", "name": "Cosmos", "type": "Crypto", "sector": "Layer-1"},
    {"symbol": "NEAR-USD", "name": "Near Protocol", "type": "Crypto", "sector": "Layer-1"},

    # 6. Layer-2 Crypto Tokens
    {"symbol": "MATIC-USD", "name": "Polygon", "type": "Crypto", "sector": "Layer-2"},
    {"symbol": "ARB-USD", "name": "Arbitrum", "type": "Crypto", "sector": "Layer-2"},
    {"symbol": "OP-USD", "name": "Optimism", "type": "Crypto", "sector": "Layer-2"},
    {"symbol": "STRK-USD", "name": "StarkNet", "type": "Crypto", "sector": "Layer-2"},

    # 7. Stablecoins
    {"symbol": "USDT-USD", "name": "Tether", "type": "Crypto", "sector": "Stablecoin"},
    {"symbol": "USDC-USD", "name": "USD Coin", "type": "Crypto", "sector": "Stablecoin"},
    {"symbol": "DAI-USD", "name": "Dai", "type": "Crypto", "sector": "Stablecoin"},

    # 8. Popular Altcoins
    {"symbol": "DOGE-USD", "name": "Dogecoin", "type": "Crypto", "sector": "Meme"},
    {"symbol": "SHIB-USD", "name": "Shiba Inu", "type": "Crypto", "sector": "Meme"},
    {"symbol": "LTC-USD", "name": "Litecoin", "type": "Crypto", "sector": "Payment"},
    {"symbol": "LINK-USD", "name": "Chainlink", "type": "Crypto", "sector": "Oracle"},
    {"symbol": "XRP-USD", "name": "XRP", "type": "Crypto", "sector": "Payment"},
    {"symbol": "XLM-USD", "name": "Stellar", "type": "Crypto", "sector": "Payment"},
    {"symbol": "VET-USD", "name": "VeChain", "type": "Crypto", "sector": "Supply Chain"},
    {"symbol": "TRX-USD", "name": "TRON", "type": "Crypto", "sector": "Platform"},

    # 9. DeFi Tokens
    {"symbol": "UNI-USD", "name": "Uniswap", "type": "Crypto", "sector": "DeFi"},
    {"symbol": "AAVE-USD", "name": "Aave", "type": "Crypto", "sector": "DeFi"},
    {"symbol": "MKR-USD", "name": "Maker", "type": "Crypto", "sector": "DeFi"},
    {"symbol": "COMP-USD", "name": "Compound", "type": "Crypto", "sector": "DeFi"},
    {"symbol": "CAKE-USD", "name": "PancakeSwap", "type": "Crypto", "sector": "DeFi"},
    {"symbol": "SNX-USD", "name": "Synthetix", "type": "Crypto", "sector": "DeFi"},

    # 10. Web3 / Gaming Tokens
    {"symbol": "MANA-USD", "name": "Decentraland", "type": "Crypto", "sector": "Gaming"},
    {"symbol": "SAND-USD", "name": "The Sandbox", "type": "Crypto", "sector": "Gaming"},
    {"symbol": "AXS-USD", "name": "Axie Infinity", "type": "Crypto", "sector": "Gaming"},
    {"symbol": "GALA-USD", "name": "Gala", "type": "Crypto", "sector": "Gaming"},
    {"symbol": "ENJ-USD", "name": "Enjin Coin", "type": "Crypto", "sector": "Gaming"},
]

def seed_assets():
    print(f"Seeding {len(MASTER_ASSETS)} assets...")
    count = 0
    for asset in MASTER_ASSETS:
        asset_service.upsert_asset(asset)
        count += 1
    print(f"Successfully seeded {count} assets.")

if __name__ == "__main__":
    seed_assets()
