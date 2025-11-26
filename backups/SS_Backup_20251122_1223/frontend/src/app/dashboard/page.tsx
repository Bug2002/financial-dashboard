"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PriceChart } from "@/components/PriceChart";
import { PredictionCard } from "@/components/PredictionCard";
import { PatternList } from "@/components/PatternList";
import { NewsPanel } from "@/components/NewsPanel";
import { Watchlist } from "@/components/Watchlist";
import { MarketOverview } from "@/components/MarketOverview";
import { Asset, PriceData, Prediction, Pattern, NewsItem } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Star, TrendingUp, TrendingDown, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [priceData, setPriceData] = useState<PriceData[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, token, logout } = useAuth();

    const fetchData = async (symbol: string) => {
        setLoading(true);
        try {
            const [priceRes, predictRes, patternRes, newsRes] = await Promise.all([
                fetch(`http://localhost:8002/api/v1/asset/${symbol}/price`),
                fetch(`http://localhost:8002/api/v1/asset/${symbol}/predict`),
                fetch(`http://localhost:8002/api/v1/asset/${symbol}/patterns`),
                fetch(`http://localhost:8002/api/v1/asset/${symbol}/news`)
            ]);

            if (priceRes.ok) setPriceData(await priceRes.json());
            if (predictRes.ok) setPrediction(await predictRes.json());
            if (patternRes.ok) setPatterns(await patternRes.json());
            if (newsRes.ok) setNews(await newsRes.json());

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedAsset) {
            const defaultAsset = { symbol: "RELIANCE.NS", name: "Reliance Industries", "type": "Stock" };
            setSelectedAsset(defaultAsset);
            fetchData(defaultAsset.symbol);
        }
    }, [selectedAsset]);

    const handleAssetSelect = (asset: Asset) => {
        setSelectedAsset(asset);
        fetchData(asset.symbol);
    };

    const addToWatchlist = async () => {
        if (!selectedAsset || !token) return;
        try {
            await fetch(`http://localhost:8002/api/v1/users/me/watchlist/${selectedAsset.symbol}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            alert(`Added ${selectedAsset.symbol} to watchlist`);
        } catch (error) {
            console.error("Failed to add to watchlist", error);
        }
    };

    const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].close : 0;
    const prevPrice = priceData.length > 1 ? priceData[priceData.length - 2].close : 0;
    const change = currentPrice - prevPrice;
    const changePct = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <div className="min-h-screen bg-background p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Overview of your market analysis.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-full md:w-80">
                            <SearchBar onSelect={handleAssetSelect} />
                        </div>
                    </div>
                </header>

                <main className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                    {/* Left Column: Watchlist (Hidden on mobile initially or stacked) */}
                    <div className="lg:col-span-3 space-y-6 hidden lg:block">
                        <Watchlist onSelect={handleAssetSelect} />
                    </div>

                    {selectedAsset && (
                        <>
                            {/* Center Column: Main Chart & Stats */}
                            <div className="lg:col-span-6 space-y-6 animate-fade-in">
                                {/* Asset Header Card */}
                                <div className="rounded-xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-3xl font-bold tracking-tight">{selectedAsset.symbol}</h2>
                                                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                                                    {selectedAsset.type}
                                                </span>
                                                {user && (
                                                    <button onClick={addToWatchlist} className="text-muted-foreground hover:text-yellow-500 transition-colors">
                                                        <Star className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-lg">{selectedAsset.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-bold tracking-tight">
                                                ₹{currentPrice.toFixed(2)}
                                            </div>
                                            <div className={cn("flex items-center justify-end gap-1 mt-1 font-medium", isPositive ? "text-green-500" : "text-red-500")}>
                                                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                <span>{change > 0 ? "+" : ""}{change.toFixed(2)} ({changePct.toFixed(2)}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Card */}
                                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                                    <div className="p-6 border-b bg-card/50">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-primary" />
                                            <h3 className="font-semibold">Price History</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 h-[450px]">
                                        {loading ? (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                <div className="animate-pulse">Loading market data...</div>
                                            </div>
                                        ) : (
                                            <PriceChart data={priceData} color={isPositive ? "#22c55e" : "#ef4444"} />
                                        )}
                                    </div>
                                </div>

                                {/* Analysis Grid */}
                                <div className="grid gap-6 md:grid-cols-2 animate-fade-in-delay-1">
                                    {prediction && <PredictionCard prediction={prediction} />}
                                    <PatternList patterns={patterns} />
                                </div>

                                {/* Market Overview Section */}
                                <div className="animate-fade-in-delay-2">
                                    <MarketOverview onSelectAsset={handleAssetSelect} />
                                </div>
                            </div>

                            {/* Right Column: News */}
                            <div className="lg:col-span-3 animate-fade-in-delay-2">
                                <NewsPanel news={news} />
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
