"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Newspaper, Settings, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-screen w-64 border-r bg-card" />; // Prevent hydration mismatch
    }

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        // { href: "/news", label: "News", icon: Newspaper }, // Future
        // { href: "/settings", label: "Settings", icon: Settings }, // Future
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary">FinSight</h1>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t hidden"> {/* Login disabled for now */}
                {user ? (
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            <button onClick={logout} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                                <LogOut className="h-3 w-3" /> Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <User className="h-5 w-5" />
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
}
