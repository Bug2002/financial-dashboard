"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip as ChartTooltip,
    Legend,
    TimeScale,
    Filler,
    ScriptableContext,
    ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
    Search,
    Bell,
    Settings,
    Menu,
    X,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    Clock,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Share2,
    Maximize2,
    Info,
    AlertTriangle,
    CheckCircle,
    Zap,
    BarChart2,
    PieChart,
    Newspaper,
    Globe,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    RefreshCw,
} from 'lucide-react';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from 'next/navigation';
import { Asset, PriceData, NewsItem, Prediction, Pattern } from '@/types';
import { SearchBar } from './SearchBar';
import { Explore } from './Explore';
import { Watchlist } from './Watchlist';
import { LogViewer } from './LogViewer';
import { NewsPanel } from './NewsPanel';
import TechnicalAnalysisWidget from './TechnicalAnalysisWidget';
import TradeModal from './TradeModal';
import { cn } from "@/lib/utils";
import { Brain, Star, ShieldAlert, FileText } from 'lucide-react';

// Helper Components
const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            active ? "bg-blue-500/10 text-blue-400 border border-blue-500/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        )}
    >
        {icon}
        {label}
    </button>
);

const Card = ({ children, className }: any) => (
    <div className={cn("bg-[#06121a] border border-slate-800 rounded-xl overflow-hidden", className)}>
        {children}
    </div>
);

const InfoCard = ({ title, value, icon, trend }: any) => (
    <Card className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</div>
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-200">{value}</div>
        {trend && <div className={cn("text-xs mt-1", trend > 0 ? "text-emerald-400" : "text-red-400")}>
            {trend > 0 ? "+" : ""}{trend}%
        </div>}
    </Card>
);

const ListCard = ({ title, items, type, onSelect }: any) => (
    <Card className="p-4">
        <h3 className="font-bold text-slate-200 mb-4">{title}</h3>
        <div className="space-y-2">
            {items.map((item: any, i: number) => (
                <div key={i} onClick={() => onSelect(item)} className="flex justify-between items-center p-2 hover:bg-slate-800 rounded cursor-pointer">
                    <span className="text-sm text-slate-300">{item.symbol || item.name}</span>
                    <span className={cn("text-sm font-mono", (item.change || 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {(item.change || 0).toFixed(2)}%
                    </span>
                </div>
            ))}
        </div>
    </Card>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

interface ModernDashboardProps {
    selectedAsset: Asset | null;
    priceData: PriceData[];
    news: NewsItem[];
    prediction: Prediction | null;
    patterns: Pattern[];
    topStocks: Asset[];
    topCrypto: Asset[];
    onSelectAsset: (asset: Asset) => void;
}

export function ModernDashboard({ selectedAsset, priceData, news, prediction, patterns, topStocks, topCrypto, onSelectAsset }: ModernDashboardProps) {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'patterns' | 'logs' | 'explore' | 'watchlist' | 'news' | 'brain'>('stocks');
    const [globalNews, setGlobalNews] = useState<NewsItem[]>([]);
    const [recentPatterns, setRecentPatterns] = useState<Pattern[]>([]);
    const [brainStatus, setBrainStatus] = useState<any>(null);
    const [showForecast, setShowForecast] = useState(false);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [portfolio, setPortfolio] = useState<{ cash: number; holdings: Record<string, number> }>({ cash: 100000, holdings: {} });
    const [logFilter, setLogFilter] = useState<string | undefined>(undefined);
    const [live, setLive] = useState(true);
    const [watchlist, setWatchlist] = useState<Asset[]>([]);
    const [showGrid, setShowGrid] = useState(false);

    // Load portfolio
    useEffect(() => {
        const saved = localStorage.getItem('demo_portfolio');
        if (saved) setPortfolio(JSON.parse(saved));
    }, []);

    const handleTrade = (type: 'BUY' | 'SELL', quantity: number, price: number) => {
        const newPortfolio = { ...portfolio };
        const cost = quantity * price;
        if (type === 'BUY') {
            if (newPortfolio.cash >= cost) {
                newPortfolio.cash -= cost;
                newPortfolio.holdings[selectedAsset?.symbol || ''] = (newPortfolio.holdings[selectedAsset?.symbol || ''] || 0) + quantity;
            } else { alert("Insufficient funds!"); return; }
        } else {
            if ((newPortfolio.holdings[selectedAsset?.symbol || ''] || 0) >= quantity) {
                newPortfolio.cash += cost;
                newPortfolio.holdings[selectedAsset?.symbol || ''] -= quantity;
            } else { alert("Insufficient holdings!"); return; }
        }
        setPortfolio(newPortfolio);
        localStorage.setItem('demo_portfolio', JSON.stringify(newPortfolio));
    };

    // Fetch Data based on Tab
    useEffect(() => {
        if (activeTab === 'patterns') {
            fetch(`${API_URL}/api/patterns/recent`).then(res => res.json()).then(data => setRecentPatterns(Array.isArray(data) ? data : [])).catch(console.error);
        } else if (activeTab === 'brain') {
            fetch(`${API_URL}/api/brain/status`).then(res => res.json()).then(data => setBrainStatus(data)).catch(console.error);
        } else if (activeTab === 'news') {
            fetch(`${API_URL}/api/news`).then(res => res.json()).then(data => setGlobalNews(Array.isArray(data) ? data : [])).catch(console.error);
        }
    }, [activeTab]);

    // Sync Tab
    useEffect(() => {
        if (tabParam && ['stocks', 'crypto', 'patterns', 'logs', 'explore', 'watchlist', 'news'].includes(tabParam)) {
            setActiveTab(tabParam as any);
        }
    }, [tabParam]);

    // Fetch Watchlist
    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/me/watchlist`);
                if (res.ok) {
                    const symbols = await res.json();
                    if (Array.isArray(symbols)) {
                        const assets = symbols.map((s: string) => ({ symbol: s, name: s, type: 'Stock' }));
                        setWatchlist(assets);
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchWatchlist();
    }, []);

    const addToWatchlist = async (asset: Asset) => {
        if (!watchlist.find(i => i.symbol === asset.symbol)) {
            const newWatchlist = [...watchlist, asset];
            setWatchlist(newWatchlist);
            try { await fetch(`${API_URL}/api/users/me/watchlist/${asset.symbol}`, { method: 'POST' }); } catch (e) { setWatchlist(watchlist); }
        }
    };

    const removeFromWatchlist = async (symbol: string) => {
        const newWatchlist = watchlist.filter(i => i.symbol !== symbol);
        setWatchlist(newWatchlist);
        try { await fetch(`${API_URL}/api/users/me/watchlist/${symbol}`, { method: 'DELETE' }); } catch (e) { setWatchlist(watchlist); }
    };

    const chartDataPoints = useMemo(() => {
        return priceData.map(d => ({
            x: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            y: d.close
        }));
    }, [priceData]);

    const commonOptions: ChartOptions<'line'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(7, 16, 33, 0.95)',
                titleColor: '#94a3b8',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: { label: (context) => `Price: ₹${(context.parsed.y || 0).toLocaleString('en-IN')}` }
            },
        },
        scales: {
            x: { display: showGrid, grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false }, ticks: { color: '#64748b', maxTicksLimit: 6 } },
            y: { display: showGrid, grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false }, ticks: { color: '#64748b', callback: (value) => `₹${value}` } },
        },
        elements: { line: { tension: 0.35, borderCapStyle: 'round' } },
        animation: { duration: 700, easing: 'easeOutCubic' },
    }), [showGrid]);

    const chartData = useMemo(() => {
        const variant = activeTab === 'stocks' ? 'stock' : 'crypto';
        const gradientColor = variant === 'stock' ? 'rgba(16,185,129,0.9)' : 'rgba(249,115,22,0.95)';
        const bgColor = variant === 'stock' ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)';
        const labels = chartDataPoints.map((d) => d.x);
        const data = chartDataPoints.map((d) => d.y);
        const datasets = [{
            label: variant, data: data, borderColor: gradientColor, backgroundColor: (context: ScriptableContext<'line'>) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, bgColor);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                return gradient;
            }, fill: true, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: gradientColor, pointHoverBorderColor: '#fff', tension: 0.35,
        }];
        if (showForecast && prediction && data.length > 0) {
            const lastPrice = data[data.length - 1];
            const targetPrice = prediction.key_levels?.target || prediction.predicted_price || lastPrice * 1.05;
            labels.push("Forecast");
            datasets.push({
                label: 'Forecast', data: [...Array(data.length - 1).fill(null), lastPrice, targetPrice], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', fill: false, pointRadius: 4, pointHoverRadius: 6, pointHoverBackgroundColor: '#a855f7', pointHoverBorderColor: '#fff', tension: 0, borderDash: [5, 5]
            } as any);
        }
        return { labels: labels, datasets: datasets };
    }, [chartDataPoints, activeTab, showForecast, prediction]);

    const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].close : 0;
    const prevPrice = priceData.length > 1 ? priceData[priceData.length - 2].close : 0;
    const change = currentPrice - prevPrice;
    const changePct = prevPrice !== 0 ? (change / prevPrice) * 100 : 0;
    const changeStr = `${change >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;

    useEffect(() => {
        if (selectedAsset) {
            if (selectedAsset.type === 'Crypto' && activeTab !== 'crypto') setActiveTab('crypto');
            else if (selectedAsset.type === 'Stock' && activeTab !== 'stocks') setActiveTab('stocks');
        }
    }, [selectedAsset]);

    const handleSearch = async (query: string) => {
        const results: any[] = [];
        if (!query || query.length < 2) return [];
        try {
            const res = await fetch(`${API_URL}/api/search?q=${query}`);
            if (res.ok) {
                const assets = await res.json();
                assets.forEach((asset: any) => {
                    results.push({
                        id: asset.symbol, type: 'Asset', title: asset.symbol, subtitle: asset.name,
                        action: () => { onSelectAsset({ ...asset, type: asset.type === 'Crypto' ? 'Crypto' : 'Stock' }); setActiveTab(asset.type === 'Crypto' ? 'crypto' : 'stocks'); }
                    });
                });
            }
        } catch (e) { console.error(e); }
        return results;
    };

    return (
        <div className="bg-[#06101a] text-slate-200 font-sans antialiased min-h-full p-6">
            <header className="flex items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-slate-400">A clean, professional view of stocks and crypto.</p>
                </div>
                <div className="flex-1 flex justify-center max-w-xl">
                    <SearchBar onSearch={handleSearch} defaultSuggestions={[]} />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-400">Current market</div>
                        <div className="text-sm text-emerald-400 font-semibold">Live · Updated</div>
                    </div>
                </div>
            </header>

            <div className="bg-[#071425] rounded-2xl p-4 shadow-md border border-slate-800 mb-6">
                <div className="flex items-center gap-6">
                    <div className="text-sm text-slate-300 font-semibold">Overview</div>
                    <div className="flex bg-slate-900/30 p-1 rounded-full" role="tablist">
                        <TabButton label="Stocks" id="stocks" active={activeTab === 'stocks'} onClick={() => setActiveTab('stocks')} />
                        <TabButton label="Crypto" id="crypto" active={activeTab === 'crypto'} onClick={() => setActiveTab('crypto')} />
                        <TabButton label="Patterns" id="patterns" active={activeTab === 'patterns'} onClick={() => setActiveTab('patterns')} />
                        <TabButton label="Brain" id="brain" active={activeTab === 'brain'} onClick={() => setActiveTab('brain')} />
                        <TabButton label="News" id="news" active={activeTab === 'news'} onClick={() => setActiveTab('news')} />
                        <TabButton label="Logs" id="logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                    </div>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {activeTab === 'explore' ? (<div className="lg:col-span-12"><Explore onSelectAsset={onSelectAsset} /></div>) :
                        activeTab === 'watchlist' ? (<div className="lg:col-span-12"><Watchlist items={watchlist} onRemove={removeFromWatchlist} onSelect={onSelectAsset} /></div>) :
                            activeTab === 'patterns' ? (<div className="lg:col-span-12"><PatternsHub patterns={recentPatterns.length > 0 ? recentPatterns : patterns} /></div>) :
                                activeTab === 'logs' ? (<div className="lg:col-span-12"><LogViewer initialCategory={logFilter} /></div>) :
                                    activeTab === 'brain' ? (
                                        <div className="lg:col-span-12">
                                            <BrainCenter
                                                status={brainStatus}
                                                onViewLogs={() => {
                                                    setLogFilter("SYSTEM_AGENT");
                                                    setActiveTab('logs');
                                                }}
                                            />
                                        </div>
                                    ) :
                                        activeTab === 'news' ? (<div className="lg:col-span-12"><NewsPanel news={globalNews} /></div>) :
                                            (
                                                <>
                                                    <div className="lg:col-span-8 space-y-6">


                                                        <Card
                                                            title={selectedAsset?.symbol || "Loading..."}
                                                            subtitle={selectedAsset?.type || "Asset"}
                                                            price={`₹${currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                            change={changeStr}
                                                            isPositive={change >= 0}
                                                            prediction={prediction}
                                                        >
                                                            <div className="h-full w-full">
                                                                {priceData.length > 0 ? (
                                                                    <Line data={chartData} options={commonOptions} />
                                                                ) : (
                                                                    <div className="h-full flex items-center justify-center text-slate-500">Loading data...</div>
                                                                )}
                                                            </div>

                                                            {/* Chart Controls */}
                                                            <div className="absolute top-4 right-20 z-20 flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setShowForecast(!showForecast)}
                                                                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${showForecast
                                                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                                                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                                                                        }`}
                                                                >
                                                                    {showForecast ? 'Hide Forecast' : 'Show Forecast'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsTradeModalOpen(true)}
                                                                    className="text-xs px-4 py-1.5 rounded-full font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
                                                                >
                                                                    Trade
                                                                </button>
                                                            </div>
                                                        </Card>

                                                        {
                                                            selectedAsset && (
                                                                <TradeModal
                                                                    isOpen={isTradeModalOpen}
                                                                    onClose={() => setIsTradeModalOpen(false)}
                                                                    asset={selectedAsset}
                                                                    currentPrice={currentPrice}
                                                                    onTrade={handleTrade}
                                                                />
                                                            )
                                                        }

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            <InfoCard title="AI Forecast" value={prediction?.signal ? `${prediction.signal.toUpperCase()}` : "NEUTRAL"} meta={`Confidence ${(prediction?.confidence || 0) * 100}%`} />
                                                            <InfoCard title="AI Accuracy" value={prediction?.accuracy ? `${prediction.accuracy}%` : "N/A"} meta="Historical Performance" />
                                                            <ListCard
                                                                title={activeTab === 'stocks' ? "Top Stocks" : "Top Crypto"}
                                                                items={activeTab === 'stocks' ? topStocks : topCrypto}
                                                                onSelect={(symbol: any) => {
                                                                    const type = activeTab === 'stocks' ? 'Stock' : 'Crypto';
                                                                    const symbolStr = typeof symbol === 'string' ? symbol : (symbol.symbol || symbol.name || "Unknown");
                                                                    const nameStr = typeof symbol === 'string' ? symbol : (symbol.name || symbol.symbol || "Unknown");
                                                                    onSelectAsset({ symbol: symbolStr, name: nameStr, type });
                                                                }}
                                                            />
                                                        </div>

                                                        <TechnicalAnalysisWidget symbol={selectedAsset?.symbol || "RELIANCE"} />

                                                        {
                                                            prediction?.reasoning && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60"
                                                                >
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Brain className="h-4 w-4 text-purple-400" />
                                                                        <h4 className="text-sm font-semibold text-slate-200">AI Analysis</h4>
                                                                    </div>
                                                                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                                                        {prediction?.reasoning}
                                                                    </p>

                                                                    {prediction.key_levels && (
                                                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/50">
                                                                            <div className="text-center">
                                                                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Entry</div>
                                                                                <div className="text-sm font-bold text-blue-400">₹{prediction.key_levels.entry}</div>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Target</div>
                                                                                <div className="text-sm font-bold text-emerald-400">₹{prediction.key_levels.target}</div>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Stop Loss</div>
                                                                                <div className="text-sm font-bold text-red-400">₹{prediction.key_levels.stop_loss}</div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )
                                                        }

                                                        {
                                                            prediction?.graham_analysis && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60 mt-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText className="h-4 w-4 text-blue-400" />
                                                                            <h4 className="text-sm font-semibold text-slate-200">Graham Value Analysis</h4>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-xs font-bold",
                                                                            prediction.graham_analysis.rating === 'Undervalued' ? "bg-emerald-500/20 text-emerald-400" :
                                                                                prediction.graham_analysis.rating === 'Overvalued' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                                        )}>
                                                                            {prediction.graham_analysis.rating.toUpperCase()} ({Math.round(prediction.graham_analysis.score)}/100)
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">P/E Ratio</div>
                                                                            <div className={cn("font-mono font-bold", prediction.graham_analysis.metrics.pe_ratio < 15 ? "text-emerald-400" : "text-red-400")}>
                                                                                {prediction.graham_analysis.metrics.pe_ratio}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">P/B Ratio</div>
                                                                            <div className={cn("font-mono font-bold", prediction.graham_analysis.metrics.pb_ratio < 1.5 ? "text-emerald-400" : "text-red-400")}>
                                                                                {prediction.graham_analysis.metrics.pb_ratio}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="space-y-2">
                                                                        {prediction.graham_analysis.details.map((detail, i) => (
                                                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", detail.startsWith("PASS") ? "bg-emerald-500" : "bg-red-500")} />
                                                                                {detail}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            )
                                                        }

                                                        {
                                                            prediction?.lynch_analysis && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60 mt-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <TrendingUp className="h-4 w-4 text-purple-400" />
                                                                            <h4 className="text-sm font-semibold text-slate-200">Lynch Growth Analysis</h4>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-xs font-bold",
                                                                            prediction.lynch_analysis.rating === 'Buy' ? "bg-emerald-500/20 text-emerald-400" :
                                                                                prediction.lynch_analysis.rating === 'Avoid' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                                        )}>
                                                                            {prediction.lynch_analysis.rating.toUpperCase()} ({Math.round(prediction.lynch_analysis.score)}/100)
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">PEG Ratio</div>
                                                                            <div className={cn("font-mono font-bold", prediction.lynch_analysis.metrics.peg_ratio < 1.0 ? "text-emerald-400" : "text-amber-400")}>
                                                                                {prediction.lynch_analysis.metrics.peg_ratio}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">Growth Rate</div>
                                                                            <div className={cn("font-mono font-bold", prediction.lynch_analysis.metrics.earnings_growth > 15 ? "text-emerald-400" : "text-slate-200")}>
                                                                                {prediction.lynch_analysis.metrics.earnings_growth}%
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="space-y-2">
                                                                        {prediction.lynch_analysis.details.map((detail: string, i: number) => (
                                                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", detail.startsWith("PASS") ? "bg-emerald-500" : detail.startsWith("FAIL") ? "bg-red-500" : "bg-amber-500")} />
                                                                                {detail}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            )
                                                        }

                                                        {
                                                            prediction?.buffett_analysis && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60 mt-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <Star className="h-4 w-4 text-amber-400" />
                                                                            <h4 className="text-sm font-semibold text-slate-200">Buffett Moat Analysis</h4>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-xs font-bold",
                                                                            prediction.buffett_analysis.rating === 'Buy' ? "bg-emerald-500/20 text-emerald-400" :
                                                                                prediction.buffett_analysis.rating === 'Avoid' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                                        )}>
                                                                            {prediction.buffett_analysis.quality.toUpperCase()} ({Math.round(prediction.buffett_analysis.score)}/100)
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">ROE</div>
                                                                            <div className={cn("font-mono font-bold", prediction.buffett_analysis.metrics.roe > 15 ? "text-emerald-400" : "text-amber-400")}>
                                                                                {prediction.buffett_analysis.metrics.roe}%
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">Gross Margin</div>
                                                                            <div className={cn("font-mono font-bold", prediction.buffett_analysis.metrics.gross_margin > 40 ? "text-emerald-400" : "text-slate-200")}>
                                                                                {prediction.buffett_analysis.metrics.gross_margin}%
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="space-y-2">
                                                                        {prediction.buffett_analysis.details.map((detail: string, i: number) => (
                                                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", detail.startsWith("PASS") ? "bg-emerald-500" : detail.startsWith("FAIL") ? "bg-red-500" : "bg-amber-500")} />
                                                                                {detail}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            )
                                                        }

                                                        {
                                                            prediction?.taleb_analysis && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60 mt-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <ShieldAlert className="h-4 w-4 text-orange-400" />
                                                                            <h4 className="text-sm font-semibold text-slate-200">Taleb Risk Radar</h4>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-xs font-bold",
                                                                            prediction.taleb_analysis.status === 'Antifragile' ? "bg-emerald-500/20 text-emerald-400" :
                                                                                prediction.taleb_analysis.status === 'Fragile' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                                                        )}>
                                                                            {prediction.taleb_analysis.status.toUpperCase()} ({Math.round(prediction.taleb_analysis.score)}/100)
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">Fragility Score</div>
                                                                            <div className={cn("font-mono font-bold", prediction.taleb_analysis.metrics.fragility_score > 30 ? "text-red-400" : "text-emerald-400")}>
                                                                                {prediction.taleb_analysis.metrics.fragility_score}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">Max Drawdown</div>
                                                                            <div className={cn("font-mono font-bold", prediction.taleb_analysis.metrics.max_drawdown < -20 ? "text-red-400" : "text-slate-200")}>
                                                                                {prediction.taleb_analysis.metrics.max_drawdown}%
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="space-y-2">
                                                                        {prediction.taleb_analysis.details.map((detail: string, i: number) => (
                                                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", detail.startsWith("PASS") ? "bg-emerald-500" : detail.startsWith("DANGER") ? "bg-red-500" : "bg-amber-500")} />
                                                                                {detail}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            )
                                                        }

                                                        {
                                                            prediction?.housel_analysis && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="bg-[#06121a] p-4 rounded-xl border border-slate-800/60 mt-4"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <Brain className="h-4 w-4 text-pink-400" />
                                                                            <h4 className="text-sm font-semibold text-slate-200">Psychology Notes</h4>
                                                                        </div>
                                                                        <div className={cn(
                                                                            "px-2 py-1 rounded text-xs font-bold",
                                                                            prediction.housel_analysis.mindset === 'Zen' ? "bg-emerald-500/20 text-emerald-400" :
                                                                                prediction.housel_analysis.mindset === 'Reckless' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                                        )}>
                                                                            {prediction.housel_analysis.mindset.toUpperCase()} ({Math.round(prediction.housel_analysis.score)}/100)
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">FOMO Risk</div>
                                                                            <div className={cn("font-mono font-bold", prediction.housel_analysis.metrics.fomo_risk === 'High' ? "text-red-400" : "text-emerald-400")}>
                                                                                {prediction.housel_analysis.metrics.fomo_risk}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-slate-900/50 p-3 rounded-lg">
                                                                            <div className="text-xs text-slate-500 mb-1">RSI Level</div>
                                                                            <div className="font-mono font-bold text-slate-200">
                                                                                {prediction.housel_analysis.metrics.rsi.toFixed(1)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <ul className="space-y-2">
                                                                        {prediction.housel_analysis.details.map((detail: string, i: number) => (
                                                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", detail.startsWith("WISDOM") ? "bg-blue-400" : detail.startsWith("FOMO") ? "bg-red-500" : "bg-slate-500")} />
                                                                                {detail}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                            )
                                                        }
                                                    </div >

                                                    <aside className="lg:col-span-4 space-y-6">
                                                        <Watchlist
                                                            items={watchlist}
                                                            onRemove={removeFromWatchlist}
                                                            onSelect={(asset) => {
                                                                onSelectAsset(asset);
                                                                setActiveTab(asset.type === 'Stock' ? 'stocks' : 'crypto');
                                                            }}
                                                        />

                                                        <motion.div className="bg-[#06121a] rounded-2xl p-4 shadow-inner border border-slate-800" initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ duration: 0.25 }}>
                                                            <h4 className="text-sm text-slate-400 mb-3">Market Movers</h4>
                                                            <ul className="space-y-3 text-sm text-slate-200">
                                                                {(activeTab === 'stocks' ? topStocks : topCrypto).slice(0, 3).map((item, i) => (
                                                                    <li key={i} className="flex justify-between cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => onSelectAsset({ symbol: item.symbol, name: item.name, type: activeTab === 'stocks' ? 'Stock' : 'Crypto' })}>
                                                                        <span>{item.symbol}</span>
                                                                        <span className={(item.change || 0) >= 0 ? "text-emerald-400" : "text-red-400"}>
                                                                            {(item.change || 0) >= 0 ? '+' : ''}{(item.change || 0).toFixed(2)}
                                                                        </span>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); addToWatchlist({ symbol: item.symbol, name: item.name, type: activeTab === 'stocks' ? 'Stock' : 'Crypto' }); }}
                                                                            className="ml-2 text-slate-600 hover:text-amber-400"
                                                                        >
                                                                            <Star className="h-3 w-3" />
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>

                                                        <div className="bg-[#06121a] rounded-2xl p-4 shadow-md border border-slate-800 min-h-[300px] flex flex-col">
                                                            <h4 className="text-sm text-slate-400 mb-3">Live News</h4>
                                                            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                                                {news.length > 0 ? news.map((item, i) => (
                                                                    <a
                                                                        key={item.id || i}
                                                                        href={item.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block group"
                                                                    >
                                                                        <div className="text-sm font-medium group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                                                                            {item.title}
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                                                            <span>{item.publisher}</span>
                                                                            <span className={cn(
                                                                                "px-1.5 py-0.5 rounded",
                                                                                item.credibility === "High" && "bg-emerald-900/30 text-emerald-400",
                                                                                item.credibility === "Medium" && "bg-amber-900/30 text-amber-400",
                                                                                item.credibility === "Low" && "bg-red-900/30 text-red-400"
                                                                            )}>{item.credibility}</span>
                                                                        </div>
                                                                    </a>
                                                                )) : (
                                                                    <div className="text-center text-slate-500 py-8">No news available</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </aside>

                                                </>
                                            )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function PatternsHub({ patterns }: { patterns: Pattern[] }) {
    const [subTab, setSubTab] = useState<'live' | 'library' | 'performance'>('live');

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-800 pb-2">
                <button onClick={() => setSubTab('live')} className={`text-sm font-medium pb-2 transition-colors ${subTab === 'live' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>Live Scan</button>
                <button onClick={() => setSubTab('library')} className={`text-sm font-medium pb-2 transition-colors ${subTab === 'library' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>Pattern Library</button>
                <button onClick={() => setSubTab('performance')} className={`text-sm font-medium pb-2 transition-colors ${subTab === 'performance' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>Performance</button>
            </div>

            {subTab === 'live' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patterns.length > 0 ? patterns.map((pattern, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#06121a] p-6 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-colors relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h3 className="font-bold text-lg text-slate-200">{pattern.name}</h3>
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-bold",
                                    pattern.type === 'Bullish' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                )}>
                                    {pattern.type.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 relative z-10">{pattern.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg relative z-10">
                                <div>
                                    <span className="block text-slate-600">Reliability</span>
                                    <span className="font-semibold text-slate-300">{pattern.reliability || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-600">Timeframe</span>
                                    <span className="font-semibold text-slate-300">{pattern.timeframe || 'Daily'}</span>
                                </div>
                                {pattern.stop_loss && (
                                    <div>
                                        <span className="block text-slate-600">Stop Loss</span>
                                        <span className="font-semibold text-red-400">₹{pattern.stop_loss}</span>
                                    </div>
                                )}
                                {pattern.target_price && (
                                    <div>
                                        <span className="block text-slate-600">Target</span>
                                        <span className="font-semibold text-emerald-400">₹{pattern.target_price}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex gap-2 relative z-10">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded transition-colors">View Chart</button>
                                <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded transition-colors border border-emerald-500/30">Set Alert</button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No patterns detected for this asset currently.</p>
                            <p className="text-xs mt-2">Try switching assets or checking back later.</p>
                        </div>
                    )}
                </div>
            )}

            {subTab === 'library' && <PatternLibrary />}

            {subTab === 'performance' && (
                <PatternPerformance />
            )}
        </div>
    );
}

function PatternPerformance() {
    const [stats, setStats] = useState({ total_patterns: 0, success_rate: 0 });

    useEffect(() => {
        fetch(`${API_URL}/api/patterns/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => {
                console.error("Failed to fetch pattern stats", err);
                setStats({ total_patterns: 0, success_rate: 0 });
            });
    }, []);

    return (
        <div className="text-center py-12 text-slate-500 bg-[#06121a] rounded-xl border border-slate-800">
            <div className="max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="text-xs text-slate-400">Patterns Tracked</div>
                        <div className="text-xl font-bold text-slate-200">{stats.total_patterns}</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <div className="text-xs text-slate-400">Avg. Success Rate</div>
                        <div className="text-xl font-bold text-emerald-400">{stats.success_rate}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PatternLibrary() {
    const patterns = [
        { name: "Double Bottom", type: "Bullish", description: "Reversal pattern indicating a drop, a rebound, another drop to the same level, and a final rebound." },
        { name: "Head and Shoulders", type: "Bearish", description: "Reversal pattern with a baseline with three peaks, the middle being the highest." },
        { name: "Bull Flag", type: "Bullish", description: "Continuation pattern representing a brief pause in a dynamic price trend." },
        { name: "Cup and Handle", type: "Bullish", description: "Bullish continuation pattern resembling a cup and a handle." }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((p, i) => (
                <div key={i} className="bg-[#06121a] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-200">{p.name}</h4>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold", p.type === 'Bullish' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{p.type}</span>
                    </div>
                    <p className="text-xs text-slate-400">{p.description}</p>
                </div>
            ))}
        </div>
    );
}



import { AgentControl } from './AgentControl';

function BrainCenter({ status, onViewLogs }: { status: any, onViewLogs: () => void }) {
    if (!status) return <div className="text-center py-12 text-slate-500">Connecting to Brain...</div>;

    return (
        <div className="space-y-6">
            <AgentControl onViewLogs={onViewLogs} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#06121a] p-6 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm text-slate-400 mb-1">System Status</div>
                        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            {status.status}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Self-healing active</div>
                    </div>
                    <Brain className="absolute right-4 top-4 h-16 w-16 text-emerald-500/10" />
                </div>

                <div className="bg-[#06121a] p-6 rounded-xl border border-slate-800">
                    <div className="text-sm text-slate-400 mb-1">Prediction Accuracy</div>
                    <div className="text-3xl font-bold text-white mb-2">{status.accuracy}%</div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${status.accuracy}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{status.total_predictions} predictions verified</div>
                </div>

                <div className="bg-[#06121a] p-6 rounded-xl border border-slate-800">
                    <div className="text-sm text-slate-400 mb-3">Active Parameters</div>
                    <div className="space-y-2">
                        {Object.entries(status.parameters || {}).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-slate-500">{key.replace('_', ' ')}</span>
                                <span className="font-mono text-blue-400">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-[#06121a] rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Recent Lessons
                </h3>
                <div className="space-y-4">
                    {status.lessons && status.lessons.length > 0 ? (
                        status.lessons.map((lesson: string, i: number) => (
                            <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                <div className="mt-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{lesson}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 italic">
                            "I am still observing the market. Check back after I validate my first predictions."
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


