"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { PriceData } from "@/types";

interface PriceChartProps {
    data: PriceData[];
    color?: string;
}

export function PriceChart({ data, color = "#3b82f6" }: PriceChartProps) {
    return (
        <div className="h-full w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        minTickGap={40}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            });
                        }}
                        className="text-xs font-medium text-muted-foreground"
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        domain={["auto", "auto"]}
                        tickFormatter={(value) => `₹${value.toFixed(2)}`}
                        className="text-xs font-medium text-muted-foreground"
                        stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.75rem",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            padding: "12px"
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px", fontSize: "12px" }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, "Price"]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
