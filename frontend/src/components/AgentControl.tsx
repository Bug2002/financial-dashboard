import { useState, useEffect } from 'react';
import { Activity, Play, Square, Terminal, ShieldCheck, Brain } from 'lucide-react';

export function AgentControl({ onViewLogs }: { onViewLogs?: () => void }) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/agent/status`);
            if (res.ok) {
                setStatus(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch agent status", e);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (action: 'start' | 'stop' | 'run') => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/agent/${action}`, { method: 'POST' });
            await fetchStatus();
        } catch (e) {
            console.error(`Failed to ${action} agent`, e);
        } finally {
            setLoading(false);
        }
    };

    if (!status) return <div className="p-4 text-slate-500">Loading Agent Status...</div>;

    return (
        <div className="bg-[#06121a] border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.is_running ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <h3 className="text-lg font-semibold text-slate-200">Autonomous System Agent</h3>
                </div>
                <div className="flex gap-2">
                    {!status.is_running ? (
                        <button
                            onClick={() => handleAction('start')}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                        >
                            <Play className="w-4 h-4" /> Start
                        </button>
                    ) : (
                        <button
                            onClick={() => handleAction('stop')}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                            <Square className="w-4 h-4" /> Stop
                        </button>
                    )}
                    <button
                        onClick={() => handleAction('run')}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    >
                        <Activity className="w-4 h-4" /> Run Now
                    </button>
                    {onViewLogs && (
                        <button
                            onClick={onViewLogs}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <Terminal className="w-4 h-4" /> Logs
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Current Action</div>
                    <div className="text-sm font-mono text-blue-300 truncate">
                        {status.current_action || "Idle"}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">Last Run</div>
                    <div className="text-sm font-mono text-slate-300">
                        {status.last_run ? new Date(status.last_run).toLocaleTimeString() : "Never"}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400 mb-1">AI Engine</div>
                    <div className="flex items-center gap-2">
                        <Brain className={`w-4 h-4 ${status.ai_enabled ? 'text-purple-400' : 'text-slate-600'}`} />
                        <span className={`text-sm ${status.ai_enabled ? 'text-purple-300' : 'text-slate-500'}`}>
                            {status.ai_enabled ? 'Gemini Pro Active' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Capabilities
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {['Health Monitoring', 'Code Scanning', 'Market Research', 'Safe Terminal'].map((cap) => (
                        <div key={cap} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/30 px-3 py-2 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {cap}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
