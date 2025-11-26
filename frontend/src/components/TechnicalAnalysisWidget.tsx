import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TechnicalAnalysis {
    summary: {
        RECOMMENDATION: string;
        BUY: number;
        SELL: number;
        NEUTRAL: number;
    };
    oscillators: {
        RECOMMENDATION: string;
        BUY: number;
        SELL: number;
        NEUTRAL: number;
    };
    moving_averages: {
        RECOMMENDATION: string;
        BUY: number;
        SELL: number;
        NEUTRAL: number;
    };
}

export default function TechnicalAnalysisWidget({ symbol }: { symbol: string }) {
    const [data, setData] = useState<TechnicalAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/asset/${symbol}/technicals`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch technicals", error);
            } finally {
                setLoading(false);
            }
        };
        if (symbol) {
            fetchData();
        }
    }, [symbol]);

    if (loading) return <div className="animate-pulse h-48 bg-slate-900/50 rounded-xl"></div>;
    if (!data) return null;

    const getColor = (rec: string | undefined | null) => {
        if (!rec) return "text-slate-400";
        if (rec.includes("BUY")) return "text-emerald-400";
        if (rec.includes("SELL")) return "text-red-400";
        return "text-slate-400";
    };

    const getBgColor = (rec: string | undefined | null) => {
        if (!rec) return "bg-slate-500/10 border-slate-500/30";
        if (rec.includes("BUY")) return "bg-emerald-500/10 border-emerald-500/30";
        if (rec.includes("SELL")) return "bg-red-500/10 border-red-500/30";
        return "bg-slate-500/10 border-slate-500/30";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#06121a] p-6 rounded-xl border border-slate-800"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-400" />
                    Technical Analysis
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getBgColor(data?.summary?.RECOMMENDATION)} ${getColor(data?.summary?.RECOMMENDATION)}`}>
                    {(data?.summary?.RECOMMENDATION || "NEUTRAL").replace("_", " ")}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Sell</div>
                    <div className="text-lg font-bold text-red-400">{data?.summary?.SELL || 0}</div>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Neutral</div>
                    <div className="text-lg font-bold text-slate-400">{data?.summary?.NEUTRAL || 0}</div>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Buy</div>
                    <div className="text-lg font-bold text-emerald-400">{data?.summary?.BUY || 0}</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Oscillators</span>
                    <span className={`font-semibold ${getColor(data?.oscillators?.RECOMMENDATION)}`}>
                        {(data?.oscillators?.RECOMMENDATION || "NEUTRAL").replace("_", " ")}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Moving Averages</span>
                    <span className={`font-semibold ${getColor(data?.moving_averages?.RECOMMENDATION)}`}>
                        {(data?.moving_averages?.RECOMMENDATION || "NEUTRAL").replace("_", " ")}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
