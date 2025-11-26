import os

file_path = 'c:/Users/sengh/OneDrive/ドキュメント/SS/frontend/src/components/ModernDashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep imports (lines 0-50)
# Note: Line 50 in 1-indexed view is index 49.
# The file view showed line 50 as '}' from imports?
# Let's check the content again.
# 1-17: chart.js
# 18: react-chartjs-2
# 19-50: lucide-react imports
# Line 50 is '}'

imports = lines[:50] 

# The rest of the file starts from line 51 (index 50)
rest_of_file = lines[50:]

# Missing block
missing_block = """
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from 'next/navigation';
import { Asset, PriceData, NewsItem, Prediction, Pattern } from '@/types';

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
"""

# Combine
new_content = "".join(imports) + missing_block + "".join(rest_of_file)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully patched ModernDashboard.tsx")
