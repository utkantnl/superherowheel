'use client';

import React, { useCallback, useState } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';

interface ImageUploadProps {
    onUpload: (imageUrl: string) => void;
    onClear: () => void;
    uploadedImage: string | null;
    isUploading: boolean;
}



export default function ImageUpload({ onUpload, onClear, uploadedImage, isUploading }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return `Invalid file type. Please use: JPEG, PNG, or WebP`;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return `File too large. Maximum size is ${formatBytes(MAX_IMAGE_SIZE)}`;
        }
        return null;
    };

    const processFile = async (file: File) => {
        setError(null);
        setUploadProgress(0);

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            // Show progress
            setUploadProgress(30);

            // Upload to server (Vercel Blob)
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(80);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);

            // Pass URL to parent
            setTimeout(() => {
                onUpload(data.imageUrl);
                setUploadProgress(0);
            }, 300);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
            setUploadProgress(0);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    if (uploadedImage) {
        return (
            <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-gray-900/50 backdrop-blur-sm">
                    <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Overlay with change button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <button
                            onClick={onClear}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                            🔄 Change Photo
                        </button>
                    </div>

                    {/* Success badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 text-white text-sm rounded-full font-medium">
                        ✓ Ready
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging
                        ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                        : 'border-gray-600 bg-gray-900/50 hover:border-purple-500/50 hover:bg-gray-800/50'
                    }
        `}
            >
                <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center justify-center py-12 px-6">
                    {uploadProgress > 0 ? (
                        <>
                            <div className="w-16 h-16 mb-4 relative">
                                <svg className="animate-spin" viewBox="0 0 24 24">
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-gray-600"
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray={`${uploadProgress * 0.628} 62.8`}
                                        className="text-purple-500"
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-purple-400">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <p className="text-gray-400">Processing...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 mb-4 text-purple-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-white mb-2">
                                {isDragging ? 'Drop your photo here!' : 'Drop your photo here'}
                            </p>
                            <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                            <div className="flex gap-2 text-xs text-gray-500">
                                <span>JPG</span>
                                <span>•</span>
                                <span>PNG</span>
                                <span>•</span>
                                <span>WebP</span>
                                <span>•</span>
                                <span>Max 5MB</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
