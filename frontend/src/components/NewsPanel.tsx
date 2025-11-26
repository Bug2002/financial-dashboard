import { NewsItem } from "@/types";
import { cn } from "@/lib/utils";
import { ExternalLink, ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface NewsPanelProps {
    news: NewsItem[];
}

export function NewsPanel({ news }: NewsPanelProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 h-full">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Live News & Verification</h3>

            <div className="space-y-6">
                {!Array.isArray(news) || news.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent news found.</p>
                ) : (
                    news.map((item) => (
                        <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col space-y-2 pb-4 border-b last:border-0 last:pb-0 hover:bg-accent/50 p-2 rounded-md transition-colors cursor-pointer block"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-sm hover:underline line-clamp-2 leading-snug">
                                    {item.title}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{item.publisher} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                                <div className={cn(
                                    "flex items-center space-x-1 px-1.5 py-0.5 rounded border",
                                    item.credibility === "High" && "bg-green-50 text-green-700 border-green-200",
                                    item.credibility === "Medium" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                                    item.credibility === "Low" && "bg-red-50 text-red-700 border-red-200"
                                )}>
                                    {item.credibility === "High" && <ShieldCheck className="h-3 w-3" />}
                                    {item.credibility === "Medium" && <Shield className="h-3 w-3" />}
                                    {item.credibility === "Low" && <ShieldAlert className="h-3 w-3" />}
                                    <span className="font-medium">{item.credibility} Credibility</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}
