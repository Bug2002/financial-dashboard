import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, FileText, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
    id: string;
    type: 'Asset' | 'News' | 'Log' | 'Pattern';
    title: string;
    subtitle?: string;
    action: () => void;
}

interface SearchBarProps {
    onSearch: (query: string) => Promise<SearchResult[]> | SearchResult[];
    defaultSuggestions?: SearchResult[];
}

export function SearchBar({ onSearch, defaultSuggestions = [] }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length > 0) {
                try {
                    const hits = await onSearch(query);
                    setResults(hits);
                    setIsOpen(true);
                } catch (e) {
                    console.error("Search failed", e);
                    setResults([]);
                }
            } else {
                setResults([]);
                // Do not force open here. Let onFocus handle it.
            }
        };

        const timeoutId = setTimeout(fetchResults, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    // Show default suggestions when query is empty
    const displayResults = query.trim().length === 0 ? defaultSuggestions : results;
    const showDropdown = isOpen && displayResults.length > 0;

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search stocks, crypto, logs..."
                    className="w-full bg-[#071425] border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-500"
                />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#06121a] border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar"
                    >
                        {query.trim().length === 0 && (
                            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/30 border-b border-slate-800/50">
                                Trending Now
                            </div>
                        )}

                        {displayResults.map((result, i) => (
                            <div
                                key={result.id || i}
                                onClick={() => {
                                    result.action();
                                    setIsOpen(false);
                                    setQuery('');
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/30 last:border-0"
                            >
                                <div className={`p-2 rounded-lg ${result.type === 'Asset' ? 'bg-emerald-500/10 text-emerald-400' :
                                    result.type === 'News' ? 'bg-blue-500/10 text-blue-400' :
                                        result.type === 'Log' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {result.type === 'Asset' && <TrendingUp className="h-4 w-4" />}
                                    {result.type === 'News' && <FileText className="h-4 w-4" />}
                                    {result.type === 'Log' && <Activity className="h-4 w-4" />}
                                    {result.type === 'Pattern' && <Activity className="h-4 w-4" />}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-200">{result.title}</div>
                                    {result.subtitle && <div className="text-xs text-slate-500">{result.subtitle}</div>}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
