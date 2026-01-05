'use client';

import React, { useState } from 'react';

interface ImageUploadProps {
    onPhotoUrlChange: (url: string) => void;
    photoUrl: string;
    isGenerating: boolean;
}

export default function ImageUpload({ onPhotoUrlChange, photoUrl, isGenerating }: ImageUploadProps) {
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const validateUrl = (url: string): boolean => {
        if (!url) return true; // Empty is ok
        if (!url.startsWith('https://')) {
            setError('URL must start with https://');
            return false;
        }
        // Basic image URL check
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasImageExt = imageExtensions.some(ext => url.toLowerCase().includes(ext));
        if (!hasImageExt && !url.includes('imgur') && !url.includes('imgbb') && !url.includes('i.ibb')) {
            setError('URL should be an image (jpg, png, webp)');
            return false;
        }
        setError(null);
        return true;
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        onPhotoUrlChange(url);

        if (url && validateUrl(url)) {
            setPreviewUrl(url);
        } else if (!url) {
            setPreviewUrl(null);
        }
    };

    const handleClear = () => {
        onPhotoUrlChange('');
        setPreviewUrl(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                    Public Photo URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        value={photoUrl}
                        onChange={handleUrlChange}
                        placeholder="https://i.ibb.co/xxxxx/photo.jpg"
                        disabled={isGenerating}
                        className={`
                            flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border text-white placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all
                            ${error ? 'border-red-500/50' : 'border-gray-700/50'}
                            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    />
                    {photoUrl && (
                        <button
                            onClick={handleClear}
                            disabled={isGenerating}
                            className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-500">
                    Upload your photo to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">ImgBB</a> or <a href="https://imgur.com/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Imgur</a> and paste the direct image URL here.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Preview */}
            {previewUrl && !error && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-gray-900/50">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={() => {
                            setError('Could not load image. Check the URL.');
                            setPreviewUrl(null);
                        }}
                        onLoad={() => setError(null)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Success badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 text-white text-sm rounded-full font-medium">
                        ✓ Ready
                    </div>
                </div>
            )}

            {/* No preview state */}
            {!previewUrl && !error && (
                <div className="rounded-2xl border-2 border-dashed border-gray-600 bg-gray-900/30 p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 text-gray-500">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 016.364 6.364l-4.5 4.5a4.5 4.5 0 01-7.244-1.242"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Enter a public image URL above</p>
                </div>
            )}
        </div>
    );
}
