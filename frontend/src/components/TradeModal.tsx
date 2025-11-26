import React, { useState, useEffect } from 'react';
import { Asset } from '../types';

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
    currentPrice: number;
    onTrade: (type: 'BUY' | 'SELL', quantity: number, price: number) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, asset, currentPrice, onTrade }) => {
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState<number>(1);
    const [total, setTotal] = useState<number>(currentPrice);

    useEffect(() => {
        setTotal(quantity * currentPrice);
    }, [quantity, currentPrice]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTrade(type, quantity, currentPrice);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1e222d] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Trade {asset.symbol}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-4 p-1 bg-[#2a2e39] rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('BUY')}
                            className={`flex-1 py-2 rounded-md font-medium transition-colors ${type === 'BUY'
                                    ? 'bg-[#00c853] text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('SELL')}
                            className={`flex-1 py-2 rounded-md font-medium transition-colors ${type === 'SELL'
                                    ? 'bg-[#ff3b30] text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sell
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Price</label>
                            <div className="w-full bg-[#2a2e39] border border-gray-700 rounded-lg px-4 py-3 text-white">
                                ${currentPrice.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="0.000001"
                                step="any"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                className="w-full bg-[#2a2e39] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Total Value</span>
                                <span className="text-white font-bold">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90 ${type === 'BUY' ? 'bg-[#00c853]' : 'bg-[#ff3b30]'
                            }`}
                    >
                        {type} {asset.symbol}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TradeModal;
