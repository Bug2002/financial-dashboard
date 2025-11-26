import { Pattern } from "@/types";
import { cn } from "@/lib/utils";

interface PatternListProps {
    patterns: Pattern[];
}

export function PatternList({ patterns }: PatternListProps) {
    if (patterns.length === 0) {
        return (
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Detected Patterns</h3>
                <p className="text-sm text-muted-foreground">No technical patterns detected recently.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Detected Patterns</h3>
            <div className="space-y-4">
                {patterns.map((pattern, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className={cn(
                            "w-2 h-2 mt-1.5 rounded-full flex-shrink-0",
                            pattern.type === "Bullish" ? "bg-green-500" : "bg-red-500"
                        )} />
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{pattern.name}</span>
                                <span className="text-[10px] text-muted-foreground border px-1 rounded">
                                    {new Date(pattern.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {pattern.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
