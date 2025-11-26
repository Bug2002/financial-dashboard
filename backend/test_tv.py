from tradingview_ta import TA_Handler, Interval, Exchange

try:
    # Test for Reliance (NSE)
    handler = TA_Handler(
        symbol="RELIANCE",
        screener="india",
        exchange="NSE",
        interval=Interval.INTERVAL_1_DAY
    )
    analysis = handler.get_analysis()
    print(f"Symbol: RELIANCE")
    print(f"Summary: {analysis.summary}")
    print(f"Oscillators: {analysis.oscillators}")
    print(f"Moving Averages: {analysis.moving_averages}")
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
