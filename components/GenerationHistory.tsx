'use client';

import React, { useEffect, useState } from 'react';

interface HistoryItem {
    id: string;
    originalImage: string;
    generatedImage: string;
    hero: string;
    timestamp: number;
}

interface GenerationHistoryProps {
    onSelect: (item: HistoryItem) => void;
    currentGeneration: { original: string; generated: string; hero: string } | null;
}

const HISTORY_KEY = 'superhero-wheel-history';
const MAX_HISTORY = 5;

export default function GenerationHistory({ onSelect, currentGeneration }: GenerationHistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse history:', e);
            }
        }
    }, []);

    // Save new generation to history
    useEffect(() => {
        if (currentGeneration?.generated) {
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                originalImage: currentGeneration.original,
                generatedImage: currentGeneration.generated,
                hero: currentGeneration.hero,
                timestamp: Date.now(),
            };

            setHistory((prev) => {
                const updated = [newItem, ...prev.filter((item) => item.generatedImage !== newItem.generatedImage)].slice(0, MAX_HISTORY);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }, [currentGeneration?.generated]);

    const clearHistory = () => {
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🕐</span>
                    <span>Recent Transformations</span>
                </h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="relative group rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:scale-105"
                    >
                        <div className="aspect-square">
                            <img
                                src={item.generatedImage}
                                alt={item.hero}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                            <span className="text-xs text-white font-medium truncate">{item.hero}</span>
                        </div>

                        {/* Hero badge */}
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-600/90 text-[10px] text-white rounded font-medium">
                            {item.hero.split(' ')[0]}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export type { HistoryItem };
