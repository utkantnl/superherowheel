'use client';

import React from 'react';

interface StyleSelectorProps {
    selectedStyle: 'realistic' | 'comic' | 'anime';
    onStyleChange: (style: 'realistic' | 'comic' | 'anime') => void;
    disabled?: boolean;
}

const styles = [
    { id: 'realistic' as const, label: 'Realistic', emoji: '🎬', description: 'Cinematic, photorealistic' },
    { id: 'comic' as const, label: 'Comic', emoji: '💥', description: 'Marvel Comics style' },
    { id: 'anime' as const, label: 'Anime', emoji: '🌸', description: 'Japanese animation' },
];

export default function StyleSelector({ selectedStyle, onStyleChange, disabled = false }: StyleSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Art Style</label>
            <div className="grid grid-cols-3 gap-2">
                {styles.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => onStyleChange(style.id)}
                        disabled={disabled}
                        className={`
              relative p-3 rounded-xl border-2 transition-all
              ${selectedStyle === style.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        <div className="text-2xl mb-1">{style.emoji}</div>
                        <div className="text-sm font-medium text-white">{style.label}</div>
                        <div className="text-[10px] text-gray-400 hidden sm:block">{style.description}</div>

                        {selectedStyle === style.id && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
