import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Asset } from '@/types';

interface WatchlistProps {
    items: Asset[];
    onRemove: (symbol: string) => void;
    onSelect: (asset: Asset) => void;
}

export function Watchlist({ items, onRemove, onSelect }: WatchlistProps) {
    return (
        <div className="bg-[#06121a] rounded-2xl p-4 shadow-md border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h4 className="text-sm font-semibold text-slate-200">Watchlist</h4>
            </div>

            {items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, i) => (
                        <motion.li
                            key={item.symbol}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 group transition-colors cursor-pointer"
                            onClick={() => onSelect(item)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-1 h-8 rounded-full ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                <div>
                                    <div className="font-bold text-sm text-slate-200">{item.symbol}</div>
                                    <div className="text-xs text-slate-500">{item.name}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(item.symbol); }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No assets in watchlist</p>
                </div>
            )}
        </div>
    );
}
