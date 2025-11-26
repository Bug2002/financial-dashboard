"use client";

import { useState, useEffect, Suspense } from "react";
import { ModernDashboard } from "@/components/ModernDashboard";
import { Asset, PriceData, Prediction, Pattern, NewsItem } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [priceData, setPriceData] = useState<PriceData[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [topStocks, setTopStocks] = useState<any[]>([]);
    const [topCrypto, setTopCrypto] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

    // Initial load
    useEffect(() => {
        if (!selectedAsset) {
            const defaultAsset = { symbol: "RELIANCE.NS", name: "Reliance Industries", "type": "Stock" };
            setSelectedAsset(defaultAsset);
        }
        fetchTopAssets();
    }, []);

    useEffect(() => {
        if (selectedAsset) {
            fetchData(selectedAsset.symbol);
        }
    }, [selectedAsset]);

} catch (error) {
    console.error("Failed to fetch data:", error);
} finally {
    setLoading(false);
}
    };

const fetchData = async (symbol: string) => {
    setLoading(true);
    try {
        // Fetch each endpoint independently to prevent one failure from breaking everything
        const fetchSafe = async (url: string) => {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (e) {
                console.warn(`Failed to fetch ${url}`, e);
                return null;
            }
        };

        const [price, newsData, pred, patternData] = await Promise.all([
            fetchSafe(`${API_URL}/api/asset/${symbol}/price`),
            fetchSafe(`${API_URL}/api/asset/${symbol}/news`),
            fetchSafe(`${API_URL}/api/asset/${symbol}/predict`),
            fetchSafe(`${API_URL}/api/asset/${symbol}/patterns`)
        ]);

        if (price) setPriceData(price);
        if (newsData) setNews(newsData);
        if (pred) setPrediction(pred);
        if (patternData) setPatterns(patternData);

    } catch (error) {
        console.error("Critical error in fetchData:", error);
    } finally {
        setLoading(false);
    }
};

const fetchTopAssets = async () => {
    try {
        const res = await fetch(`${API_URL}/api/market/movers`);
        if (res.ok) {
            const data = await res.json();
            // Filter by type
            const stocks = data.filter((a: any) => a.type === 'Stock' || a.type === 'Index');
            const crypto = data.filter((a: any) => a.type === 'Crypto');

            setTopStocks(stocks);
            setTopCrypto(crypto);
        }
    } catch (e) {
        console.error("Failed to fetch market movers", e);
    }
};

const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
};

return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#020617] text-slate-400">Loading Dashboard...</div>}>
        <ModernDashboard
            selectedAsset={selectedAsset}
            priceData={priceData}
            news={news}
            prediction={prediction}
            patterns={patterns}
            topStocks={topStocks}
            topCrypto={topCrypto}
            onSelectAsset={handleAssetSelect}
        />
    </Suspense>
);
}
