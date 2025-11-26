import React, { useEffect, useState, useRef } from 'react';
import { Terminal, AlertTriangle, Info, CheckCircle, Search, Filter, RefreshCw, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogEntry {
    id: number;
    timestamp: string;
    level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    category: string;
    message: string;
    metadata: any;
}

interface LogStats {
    total_logs: number;
    error_count: number;
    warning_count: number;
}

export function LogViewer({ initialCategory }: { initialCategory?: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [filterLevel, setFilterLevel] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialCategory || "");
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/api/logs`);
            if (filterLevel) url.searchParams.append('level', filterLevel);

            const res = await fetch(url.toString());
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);

            const statsRes = await fetch(`${API_URL}/api/logs/stats`);
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (e) {
            console.error("Failed to fetch logs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [filterLevel]);

    const filteredLogs = logs.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = () => {
        const text = filteredLogs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.level}] [${log.category}] ${log.message}`).join('\n');
        navigator.clipboard.writeText(text);
        alert("Logs copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#06121a] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Terminal className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Total Events</div>
                        <div className="text-2xl font-bold text-slate-200">{stats?.total_logs || 0}</div>
                    </div>
                </div>
                <div className="bg-[#06121a] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Warnings</div>
                        <div className="text-2xl font-bold text-amber-400">{stats?.warning_count || 0}</div>
                    </div>
                </div>
                <div className="bg-[#06121a] border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Errors</div>
                        <div className="text-2xl font-bold text-red-400">{stats?.error_count || 0}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#06121a] p-4 rounded-xl border border-slate-800">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['INFO', 'WARNING', 'ERROR'].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterLevel(filterLevel === level ? null : level)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                filterLevel === level
                                    ? level === 'ERROR' ? "bg-red-500/20 border-red-500/50 text-red-400"
                                        : level === 'WARNING' ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                            : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                                    : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                            )}
                        >
                            {level}
                        </button>
                    ))}
                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                        title="Refresh Logs"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                        title="Copy Logs"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-[#06121a] border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-4 font-medium">Timestamp</th>
                                <th className="p-4 font-medium">Level</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-900/30 transition-colors font-mono">
                                    <td className="p-4 text-slate-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-[10px] font-bold",
                                            log.level === 'ERROR' ? "bg-red-500/20 text-red-400" :
                                                log.level === 'WARNING' ? "bg-amber-500/20 text-amber-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300">{log.category}</td>
                                    <td className="p-4 text-slate-400">{log.message}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
