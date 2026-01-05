'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import SpinWheel from '@/components/SpinWheel';
import ImageUpload from '@/components/ImageUpload';
import ResultPanel from '@/components/ResultPanel';
import GenerationHistory, { HistoryItem } from '@/components/GenerationHistory';
import StyleSelector from '@/components/StyleSelector';

type ArtStyle = 'realistic' | 'comic' | 'anime';

interface GenerationState {
    original: string;
    generated: string;
    hero: string;
}

export default function WheelPage() {
    // Upload state - now stores both URL (for display) and base64 (for API)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Wheel state
    const [selectedHero, setSelectedHero] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    // Generation state
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Style state
    const [artStyle, setArtStyle] = useState<ArtStyle>('realistic');

    // History tracking
    const [currentGeneration, setCurrentGeneration] = useState<GenerationState | null>(null);

    // Handle image upload - now also receives base64 data
    const handleUpload = useCallback((imageUrl: string, imageBase64: string) => {
        setUploadedImage(imageUrl);
        setUploadedImageBase64(imageBase64);
        setIsUploading(false);
        // Clear previous results when new image is uploaded
        setSelectedHero(null);
        setGeneratedImage(null);
        setGenerationError(null);
        setCurrentGeneration(null);
    }, []);

    const handleUploadClear = useCallback(() => {
        setUploadedImage(null);
        setUploadedImageBase64(null);
        setSelectedHero(null);
        setGeneratedImage(null);
        setGenerationError(null);
        setCurrentGeneration(null);
    }, []);

    // Handle spin complete
    const handleSpinComplete = useCallback(async (hero: string) => {
        setSelectedHero(hero);
        setIsSpinning(false);

        // Auto-generate after spin
        if (uploadedImageBase64) {
            await generateSuperheroImage(hero);
        }
    }, [uploadedImageBase64, artStyle]);

    // Generate superhero image - now sends base64 instead of URL
    const generateSuperheroImage = async (hero: string) => {
        if (!uploadedImageBase64) return;

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedImage(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageBase64: uploadedImageBase64, // Send base64 instead of URL
                    selectedHero: hero,
                    style: artStyle,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            setGeneratedImage(data.generatedUrl);
            setCurrentGeneration({
                original: uploadedImage || '',
                generated: data.generatedUrl,
                hero: hero,
            });
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationError(
                error instanceof Error ? error.message : 'Failed to generate image. Please try again.'
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // Retry generation
    const handleRetry = useCallback(() => {
        if (selectedHero) {
            generateSuperheroImage(selectedHero);
        }
    }, [selectedHero, uploadedImageBase64, artStyle]);

    // Handle history selection
    const handleHistorySelect = useCallback((item: HistoryItem) => {
        setUploadedImage(item.originalImage);
        setGeneratedImage(item.generatedImage);
        setSelectedHero(item.hero);
        setGenerationError(null);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
            {/* Background effects - smaller on mobile */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
                {/* Header with back button - compact on mobile */}
                <header className="text-center mb-6 sm:mb-8 md:mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Ana Sayfa
                    </Link>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 sm:mb-4">
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            Superhero Wheel
                        </span>
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-2">
                        Fotoğrafını yükle, çarkı çevir ve süper kahramana dönüş! 🦸‍♂️✨
                    </p>
                </header>

                {/* Main layout - single column on mobile, 3 columns on desktop - Middle column wider */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1.5fr_1fr] gap-4 sm:gap-6 max-w-[1400px] mx-auto">
                    {/* Left column: History (Hidden on mobile, shown on desktop) */}
                    <div className="hidden lg:block">
                        <div className="sticky top-8">
                            <GenerationHistory
                                onSelect={handleHistorySelect}
                                currentGeneration={currentGeneration}
                            />
                        </div>
                    </div>

                    {/* Middle column: Upload + Style + Wheel */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Upload section */}
                        <section className="bg-gray-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-800/50 p-4 sm:p-5 shadow-2xl">
                            <h2 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <span className="text-lg sm:text-xl">📸</span>
                                Adım 1: Fotoğrafını Yükle
                            </h2>
                            <ImageUpload
                                onUpload={handleUpload}
                                onClear={handleUploadClear}
                                uploadedImage={uploadedImage}
                                isUploading={isUploading}
                            />
                        </section>

                        {/* Style selector */}
                        <section className="bg-gray-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-800/50 p-4 sm:p-5 shadow-2xl">
                            <h2 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                                <span className="text-lg sm:text-xl">🎨</span>
                                Adım 2: Sanat Stilini Seç
                            </h2>
                            <StyleSelector
                                selectedStyle={artStyle}
                                onStyleChange={setArtStyle}
                                disabled={isGenerating}
                            />
                        </section>

                        {/* Spin wheel section - responsive height and increased visibility */}
                        <section className="bg-gray-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-800/50 p-4 sm:p-8 shadow-2xl relative overflow-visible">
                            <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <span className="text-lg sm:text-xl">🎰</span>
                                Adım 3: Çarkı Çevir!
                            </h2>
                            <div className="flex justify-center items-center min-h-[350px] sm:min-h-[500px] md:min-h-[620px] overflow-visible">
                                <SpinWheel
                                    onSpinComplete={handleSpinComplete}
                                    disabled={!uploadedImageBase64 || isGenerating}
                                    isSpinning={isSpinning}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right column: Results */}
                    <div className="space-y-6">
                        <section className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-5 shadow-2xl sticky top-8">
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-xl">✨</span>
                                Dönüşümün
                            </h2>
                            <ResultPanel
                                originalImage={uploadedImage}
                                generatedImage={generatedImage}
                                selectedHero={selectedHero}
                                isGenerating={isGenerating}
                                error={generationError}
                                onRetry={handleRetry}
                            />
                        </section>

                        {/* Mobile History */}
                        <div className="lg:hidden">
                            <GenerationHistory
                                onSelect={handleHistorySelect}
                                currentGeneration={currentGeneration}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-8 sm:mt-12 md:mt-16 pb-6 sm:pb-8">
                    <p className="text-gray-500 text-sm sm:text-lg font-medium px-4">
                        Bu bir <span className="text-purple-400 font-bold">Utkan Tunalı</span> markasıdır
                    </p>
                </footer>
            </div>
        </div>
    );
}
