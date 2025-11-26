"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSelect: (asset: Asset) => void;
    className?: string;
}

export function SearchBar({ onSelect, className }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Asset[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchResults = async () => {
            // If query is empty, we can fetch default suggestions or just show nothing
            // But user asked for default suggestions on click (focus)
            // So we might want to fetch default assets if query is empty
            let url = `http://localhost:8002/api/v1/search?q=${query}`;
            if (query.length === 0) {
                // Fetch default suggestions (e.g. "A" or just common assets)
                // For now, let's just search for "A" to get some results, or we could add a "defaults" endpoint
                // Using a common letter to get some results as defaults
                url = `http://localhost:8002/api/v1/search?q=A`;
            }

            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Failed to search assets:", error);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Group results by type
    const stocks = results.filter(r => r.type === 'Stock');
    const crypto = results.filter(r => r.type === 'Crypto');
    const others = results.filter(r => r.type !== 'Stock' && r.type !== 'Crypto');

    return (
        <div ref={wrapperRef} className={cn("relative w-full max-w-md", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for symbol or name..."
                    className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            {isOpen && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    {stocks.length > 0 && (
                        <>
                            <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Stocks</li>
                            {stocks.map((asset) => (
                                <li
                                    key={asset.symbol}
                                    onClick={() => {
                                        onSelect(asset);
                                        setQuery(asset.symbol);
                                        setIsOpen(false);
                                    }}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                                >
                                    <span className="font-medium w-24">{asset.symbol}</span>
                                    <span className="text-muted-foreground truncate">{asset.name}</span>
                                </li>
                            ))}
                        </>
                    )}

                    {crypto.length > 0 && (
                        <>
                            <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Crypto</li>
                            {crypto.map((asset) => (
                                <li
                                    key={asset.symbol}
                                    onClick={() => {
                                        onSelect(asset);
                                        setQuery(asset.symbol);
                                        setIsOpen(false);
                                    }}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                                >
                                    <span className="font-medium w-24">{asset.symbol}</span>
                                    <span className="text-muted-foreground truncate">{asset.name}</span>
                                </li>
                            ))}
                        </>
                    )}

                    {others.length > 0 && (
                        <>
                            <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Other</li>
                            {others.map((asset) => (
                                <li
                                    key={asset.symbol}
                                    onClick={() => {
                                        onSelect(asset);
                                        setQuery(asset.symbol);
                                        setIsOpen(false);
                                    }}
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                                >
                                    <span className="font-medium w-24">{asset.symbol}</span>
                                    <span className="text-muted-foreground truncate">{asset.name}</span>
                                </li>
                            ))}
                        </>
                    )}
                </ul>
            )}
        </div>
    );
}
