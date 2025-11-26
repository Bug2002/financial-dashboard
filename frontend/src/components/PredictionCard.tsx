import { Prediction } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PredictionCardProps {
    prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
    const isBullish = prediction.signal === "Buy";
    const isBearish = prediction.signal === "Sell";

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold leading-none tracking-tight">
                    {prediction.horizon_days}-Day Forecast
                </h3>
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    isBullish && "bg-green-100 text-green-700 border-green-200",
                    isBearish && "bg-red-100 text-red-700 border-red-200",
                    !isBullish && !isBearish && "bg-gray-100 text-gray-700 border-gray-200"
                )}>
                    {prediction.signal.toUpperCase()}
                </span>
            </div>

            <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-3xl font-bold">
                    {prediction.predicted_change_pct > 0 ? "+" : ""}
                    {prediction.predicted_change_pct}%
                </span>
                <span className="text-sm text-muted-foreground">expected return</span>
            </div>

            <div className="text-sm text-muted-foreground mb-6">
                Target: ${prediction.predicted_price} (Range: ${prediction.lower_bound} - ${prediction.upper_bound})
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Confidence</span>
                    <span>{Math.round(prediction.confidence * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full",
                            prediction.confidence > 0.7 ? "bg-green-500" :
                                prediction.confidence > 0.4 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${prediction.confidence * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
