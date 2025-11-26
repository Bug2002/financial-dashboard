"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Asset, PriceData } from "@/types";

interface MarketItemProps {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    onClick: (symbol: string) => void;
}

function MarketItem({ symbol, name, price, change, changePercent, onClick }: MarketItemProps) {
    const isPositive = change >= 0;

    return (
        <div
            onClick={() => onClick(symbol)}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
        >
            <div className="flex flex-col">
                <span className="font-bold text-sm">{symbol}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{name}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-medium text-sm">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={cn(
                    "text-xs flex items-center",
                    isPositive ? "text-green-500" : "text-red-500"
                )}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {Math.abs(changePercent).toFixed(2)}%
                </span>
            </div>
        </div>
    );
}

interface MarketOverviewProps {
    onSelectAsset: (asset: Asset) => void;
}

export function MarketOverview({ onSelectAsset }: MarketOverviewProps) {
    // Hardcoded list for now, could be fetched from API
    const topStocks = [
        { symbol: "RELIANCE.NS", name: "Reliance Industries" },
        { symbol: "TCS.NS", name: "Tata Consultancy Services" },
        { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
        { symbol: "INFY.NS", name: "Infosys" }
    ];

    const topCrypto = [
        { symbol: "BTC-USD", name: "Bitcoin" },
        { symbol: "ETH-USD", name: "Ethereum" },
        { symbol: "SOL-USD", name: "Solana" },
        { symbol: "DOGE-USD", name: "Dogecoin" }
    ];

    // We'll fetch prices for these on mount
    const [prices, setPrices] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchPrices = async () => {
            const allSymbols = [...topStocks, ...topCrypto];
            const newPrices: Record<string, any> = {};

            await Promise.all(allSymbols.map(async (asset) => {
                try {
                    const res = await fetch(`http://localhost:8002/api/v1/asset/${asset.symbol}/price?days=2`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const latest = data[data.length - 1];
                            const prev = data.length > 1 ? data[data.length - 2] : latest;
                            const change = latest.close - prev.close;
                            const changePercent = (change / prev.close) * 100;

                            newPrices[asset.symbol] = {
                                price: latest.close,
                                change: change,
                                changePercent: changePercent
                            };
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch price for ${asset.symbol}`, e);
                }
            }));

            setPrices(newPrices);
        };

        fetchPrices();
        // Refresh every minute
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleSelect = (symbol: string, name: string, type: 'Stock' | 'Crypto') => {
        onSelectAsset({ symbol, name, type });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Stocks Section */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold leading-none tracking-tight">Top Stocks</h3>
                </div>
                <div className="space-y-2">
                    {topStocks.map(stock => (
                        <MarketItem
                            key={stock.symbol}
                            symbol={stock.symbol}
                            name={stock.name}
                            price={prices[stock.symbol]?.price || 0}
                            change={prices[stock.symbol]?.change || 0}
                            changePercent={prices[stock.symbol]?.changePercent || 0}
                            onClick={() => handleSelect(stock.symbol, stock.name, 'Stock')}
                        />
                    ))}
                </div>
            </div>

            {/* Crypto Section */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold leading-none tracking-tight">Top Crypto</h3>
                </div>
                <div className="space-y-2">
                    {topCrypto.map(crypto => (
                        <MarketItem
                            key={crypto.symbol}
                            symbol={crypto.symbol}
                            name={crypto.name}
                            price={prices[crypto.symbol]?.price || 0}
                            change={prices[crypto.symbol]?.change || 0}
                            changePercent={prices[crypto.symbol]?.changePercent || 0}
                            onClick={() => handleSelect(crypto.symbol, crypto.name, 'Crypto')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
