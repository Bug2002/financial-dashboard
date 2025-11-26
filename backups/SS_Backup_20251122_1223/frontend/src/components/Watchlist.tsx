"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star, Trash2 } from "lucide-react";
import { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface WatchlistProps {
    onSelect: (asset: Asset) => void;
}

export function Watchlist({ onSelect }: WatchlistProps) {
    const { user, token } = useAuth();
    const [watchlist, setWatchlist] = useState<string[]>([]);

    useEffect(() => {
        if (user && token) {
            fetchWatchlist();
        } else {
            setWatchlist([]);
        }
    }, [user, token]);

    const fetchWatchlist = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/v1/users/me/watchlist", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setWatchlist(data);
            }
        } catch (error) {
            console.error("Failed to fetch watchlist", error);
        }
    };

    const removeFromWatchlist = async (symbol: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:8002/api/v1/users/me/watchlist/${symbol}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setWatchlist((prev) => prev.filter((s) => s !== symbol));
            }
        } catch (error) {
            console.error("Failed to remove from watchlist", error);
        }
    };

    if (!user) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Watchlist</h3>
                <p className="text-sm text-muted-foreground">
                    <a href="/login" className="text-primary hover:underline">Log in</a> to save assets.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">My Watchlist</h3>
            {watchlist.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your watchlist is empty.</p>
            ) : (
                <ul className="space-y-2">
                    {watchlist.map((symbol) => (
                        <li
                            key={symbol}
                            onClick={() => onSelect({ symbol, name: symbol, type: "Unknown" })} // Simplified asset obj
                            className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group"
                        >
                            <span className="font-medium text-sm">{symbol}</span>
                            <button
                                onClick={(e) => removeFromWatchlist(symbol, e)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
