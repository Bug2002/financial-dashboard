import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';

interface Mover {
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

interface MarketData {
    gainers: Mover[];
    losers: Mover[];
    active: Mover[];
}

export function Explore({ onSelectAsset }: { onSelectAsset: (asset: any) => void }) {
    const [data, setData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
                const res = await fetch(`${API_URL}/api/market/movers`);
                if (res.ok) {
                    const rawData = await res.json();
                    if (Array.isArray(rawData)) {
                        // Process flat list into categories
                        const gainers = [...rawData].filter((m: Mover) => m.change > 0).sort((a, b) => b.change - a.change).slice(0, 5);
                        const losers = [...rawData].filter((m: Mover) => m.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);
                        const active = [...rawData].sort((a, b) => b.volume - a.volume).slice(0, 5);

                        setData({ gainers, losers, active });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch market movers", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-20 text-slate-500 animate-pulse">Loading market data...</div>;
    }

    if (!data) return <div className="text-center py-20 text-slate-500">Failed to load market data. Please try again later.</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MoverCard
                    title="Top Gainers"
                    icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
                    items={data.gainers}
                    type="gainer"
                    onSelect={onSelectAsset}
                />
                <MoverCard
                    title="Top Losers"
                    icon={<TrendingDown className="h-5 w-5 text-red-400" />}
                    items={data.losers}
                    type="loser"
                    onSelect={onSelectAsset}
                />
                <MoverCard
                    title="Most Active"
                    icon={<Activity className="h-5 w-5 text-blue-400" />}
                    items={data.active}
                    type="active"
                    onSelect={onSelectAsset}
                />
            </div>
        </div>
    );
}

function MoverCard({ title, icon, items, type, onSelect }: { title: string, icon: React.ReactNode, items: Mover[], type: 'gainer' | 'loser' | 'active', onSelect: (a: any) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#06121a] rounded-2xl border border-slate-800 overflow-hidden"
        >
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                {icon}
                <h3 className="font-bold text-slate-200">{title}</h3>
            </div>
            <div className="p-2">
                {items.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => onSelect({ symbol: item.symbol, name: item.symbol, type: 'Stock' })}
                        className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg cursor-pointer group transition-colors"
                    >
                        <div>
                            <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">{item.symbol}</div>
                            <div className="text-xs text-slate-500">₹{(item.price || 0).toFixed(2)}</div>
                        </div>
                        <div className={`text-sm font-bold ${(item.change || 0) > 0 ? 'text-emerald-400' : ((item.change || 0) < 0 ? 'text-red-400' : 'text-slate-400')
                            }`}>
                            {(item.change || 0) > 0 ? '+' : ''}{(item.change || 0).toFixed(2)}%
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900/30 text-center">
                <button className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 w-full transition-colors">
                    View All <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        </motion.div>
    );
}
