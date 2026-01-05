'use client';

import React from 'react';

interface ResultPanelProps {
    originalImage: string | null;
    generatedImage: string | null;
    selectedHero: string | null;
    isGenerating: boolean;
    error: string | null;
    onRetry: () => void;
}

export default function ResultPanel({
    originalImage,
    generatedImage,
    selectedHero,
    isGenerating,
    error,
    onRetry,
}: ResultPanelProps) {
    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superhero-${selectedHero?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    if (!originalImage && !generatedImage && !isGenerating) {
        return (
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 text-gray-600">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">Your Transformation Awaits</h3>
                <p className="text-sm text-gray-500">
                    Upload a photo and spin the wheel to become a superhero!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Result header */}
            {selectedHero && (
                <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold">
                        🦸 Transforming into {selectedHero}
                    </span>
                </div>
            )}

            {/* Image comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original image */}
                {originalImage && (
                    <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900/50">
                        <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700">
                            <span className="text-sm font-medium text-gray-300">📷 Original</span>
                        </div>
                        <div className="aspect-square">
                            <img
                                src={originalImage}
                                alt="Original"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Generated image or loading state */}
                <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900/50">
                    <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">
                            ✨ {isGenerating ? 'Generating...' : 'Superhero'}
                        </span>
                        {generatedImage && (
                            <button
                                onClick={handleDownload}
                                className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                            >
                                ⬇️ Download
                            </button>
                        )}
                    </div>
                    <div className="aspect-square relative">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                {/* Animated loading */}
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: '2s' }} />
                                </div>
                                <p className="text-purple-300 font-medium mb-2">AI Magic in Progress</p>
                                <p className="text-gray-500 text-sm">This may take up to 30 seconds...</p>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                                <div className="w-16 h-16 mb-4 text-red-400">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-red-400 font-medium mb-2">Generation Failed</p>
                                <p className="text-gray-500 text-sm mb-4">{error}</p>
                                <button
                                    onClick={onRetry}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                                >
                                    🔄 Try Again
                                </button>
                            </div>
                        ) : generatedImage ? (
                            <img
                                src={generatedImage}
                                alt="Generated Superhero"
                                className="w-full h-full object-cover animate-fade-in"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <p className="text-gray-500">Waiting for transformation...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Download button (large, prominent) */}
            {generatedImage && !isGenerating && (
                <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/30"
                >
                    ⬇️ Download Your Superhero Image
                </button>
            )}
        </div>
    );
}
