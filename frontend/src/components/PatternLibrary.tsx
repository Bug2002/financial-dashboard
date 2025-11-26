import React from 'react';
import { motion } from 'framer-motion';

const PATTERNS_DB = [
    {
        name: "Head and Shoulders",
        type: "Bearish",
        description: "A reversal pattern characterized by three peaks, with the middle one being the highest (head) and the other two (shoulders) being lower and roughly equal.",
        implication: "Signals a trend reversal from bullish to bearish.",
        validation: "Break below the neckline (support connecting the lows of the two troughs).",
        stopLoss: "Just above the right shoulder.",
        target: "Distance from head to neckline, projected down from breakout."
    },
    {
        name: "Double Bottom",
        type: "Bullish",
        description: "A reversal pattern describing a drop, a rebound, another drop to the same level, and finally another rebound.",
        implication: "Signals a trend reversal from bearish to bullish.",
        validation: "Break above the neckline (resistance connecting the high between bottoms).",
        stopLoss: "Just below the second bottom.",
        target: "Distance from bottom to neckline, projected up from breakout."
    },
    {
        name: "Bull Flag",
        type: "Bullish",
        description: "A continuation pattern where a sharp rise (pole) is followed by a consolidation channel (flag) sloping downwards.",
        implication: "Signals continuation of the uptrend.",
        validation: "Breakout above the upper channel line.",
        stopLoss: "Below the lowest point of the flag.",
        target: "Length of the pole projected from the breakout point."
    },
    {
        name: "Ascending Triangle",
        type: "Bullish",
        description: "A continuation pattern formed by a horizontal resistance line and a rising support line.",
        implication: "Signals likely breakout to the upside.",
        validation: "Close above the horizontal resistance line.",
        stopLoss: "Below the most recent swing low on the rising trendline.",
        target: "Height of the triangle projected from the breakout point."
    },
    {
        name: "Morning Star",
        type: "Bullish",
        description: "A three-candle pattern: a long bearish candle, a small-bodied candle (star), and a long bullish candle.",
        implication: "Signals a bullish reversal.",
        validation: "Third candle closes well into the body of the first candle.",
        stopLoss: "Below the low of the star.",
        target: "Next major resistance level."
    }
];

export function PatternLibrary() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PATTERNS_DB.map((pattern, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#06121a] p-6 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-slate-200">{pattern.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${pattern.type === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {pattern.type.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{pattern.description}</p>

                    <div className="space-y-2 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg">
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Validation:</span>
                            <span className="text-right max-w-[60%]">{pattern.validation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Stop Loss:</span>
                            <span className="text-right max-w-[60%]">{pattern.stopLoss}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-400">Target:</span>
                            <span className="text-right max-w-[60%]">{pattern.target}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
