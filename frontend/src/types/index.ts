export interface Asset {
    symbol: string;
    name: string;
    type: string;
    change?: number;
}

export interface PriceData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Prediction {
    horizon_days: number;
    current_price: number;
    predicted_price: number;
    predicted_change_pct: number;
    lower_bound: number;
    upper_bound: number;
    signal: 'buy' | 'sell' | 'hold' | 'Buy' | 'Sell' | 'Hold';
    confidence: number;
    reasoning: string;
    accuracy?: number;
    timestamp: string;
    key_levels?: {
        entry: number;
        target: number;
        stop_loss: number;
    };
    graham_analysis?: {
        score: number;
        rating: string;
        details: string[];
        metrics: {
            pe_ratio: number;
            pb_ratio: number;
            eps: number;
            book_value: number;
            current_ratio: number;
            debt_to_equity: number;
        };
    };
    lynch_analysis?: {
        score: number;
        rating: string;
        details: string[];
        metrics: {
            peg_ratio: number;
            earnings_growth: number;
            inventory_turnover: number;
            debt_equity: number;
        };
    };
    buffett_analysis?: {
        score: number;
        rating: string;
        quality: string;
        details: string[];
        metrics: {
            roe: number;
            gross_margin: number;
            debt_to_equity: number;
            free_cash_flow: number;
        };
    };
    taleb_analysis?: {
        score: number;
        status: string;
        details: string[];
        metrics: {
            fragility_score: number;
            max_drawdown: number;
            volatility: number;
            tail_risk: string;
        };
    };
    housel_analysis?: {
        score: number;
        mindset: string;
        details: string[];
        metrics: {
            fomo_risk: string;
            patience_score: number;
            rsi: number;
            market_sentiment: string;
        };
    };
    reliability?: string;
    stop_loss?: number;
    target_price?: number;
    timeframe?: string;
}

export interface Pattern {
    name: string;
    type: 'Bullish' | 'Bearish';
    description: string;
    reliability: string;
    timeframe: string;
    timestamp: string;
    stop_loss?: number;
    target_price?: number;
}

export interface NewsItem {
    id: string;
    title: string;
    publisher: string;
    timestamp: string;
    credibility: "High" | "Medium" | "Low";
    url: string;
}
