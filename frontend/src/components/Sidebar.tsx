
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Newspaper, LogOut, Star, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const links = [
        { name: "Dashboard", href: "/dashboard?tab=stocks", icon: LayoutDashboard },
        { name: "Watchlist", href: "/dashboard?tab=watchlist", icon: Star },
        { name: "Analytics", href: "/dashboard?tab=patterns", icon: PieChart },
        { name: "News", href: "/dashboard?tab=news", icon: Newspaper },
    ];

    if (!mounted) {
        return (
            <div className="h-full w-64 bg-[#071021] border-r border-slate-800/40 flex flex-col p-6 shadow-lg shadow-black/50">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-900/20">
                        FS
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-100">FinSight</h1>
                        <p className="text-xs text-slate-400">Professional insights</p>
                    </div>
                </div>
                {/* Skeleton for links */}
                <div className="flex-1 space-y-2 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-slate-800/50 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-64 bg-[#071021] border-r border-slate-800/40 flex flex-col p-6 shadow-lg shadow-black/50">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-black font-extrabold shadow-lg shadow-emerald-900/20">
                    FS
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-slate-100">FinSight</h1>
                    <p className="text-xs text-slate-400">Professional insights</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-slate-800/60 to-slate-900/50 text-emerald-400 shadow-sm border border-slate-700/50"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-slate-500")} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800/50">
                {user ? (
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-600">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-slate-200">{user.username}</p>
                            <button onClick={logout} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                <LogOut className="h-3 w-3" /> Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 px-2">
                        Logged out · <Link href="/login" className="underline hover:text-emerald-400 transition-colors">Log in</Link> to save assets
                    </div>
                )}
            </div>
        </div>
    );
}

