export interface Asset {
    symbol: string;
    name: string;
    type: string;
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
    signal: "Buy" | "Sell" | "Neutral";
    confidence: number;
    timestamp: string;
}

export interface Pattern {
    name: string;
    type: "Bullish" | "Bearish";
    description: string;
    timestamp: string;
}

export interface NewsItem {
    id: string;
    title: string;
    publisher: string;
    timestamp: string;
    credibility: "High" | "Medium" | "Low";
    url: string;
}
