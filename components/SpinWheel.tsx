'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SUPERHEROES, WHEEL_COLORS } from '@/lib/constants';

interface SpinWheelProps {
    onSpinComplete: (hero: string) => void;
    disabled?: boolean;
    isSpinning?: boolean;
}

const SEGMENT_COUNT = SUPERHEROES.length;
const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;

export default function SpinWheel({ onSpinComplete, disabled = false, isSpinning: externalSpinning }: SpinWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [selectedHero, setSelectedHero] = useState<string | null>(null);
    const animationRef = useRef<number | null>(null);

    const isCurrentlySpinning = externalSpinning !== undefined ? externalSpinning : spinning;

    // Modern wheel drawing
    const drawWheel = useCallback((ctx: CanvasRenderingContext2D, currentRotation: number) => {
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Outer ring glow effect
        const outerGlow = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius + 30);
        outerGlow.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        outerGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
        outerGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Outer decorative ring with neon effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
        const ringGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        ringGradient.addColorStop(0, '#8B5CF6');
        ringGradient.addColorStop(0.5, '#EC4899');
        ringGradient.addColorStop(1, '#3B82F6');
        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Draw tick marks around the wheel
        ctx.save();
        ctx.translate(centerX, centerY);
        for (let i = 0; i < 60; i++) {
            ctx.rotate((2 * Math.PI) / 60);
            ctx.beginPath();
            ctx.moveTo(radius + 2, 0);
            ctx.lineTo(radius + (i % 5 === 0 ? 8 : 5), 0);
            ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = i % 5 === 0 ? 2 : 1;
            ctx.stroke();
        }
        ctx.restore();

        // Draw segments with modern gradients
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            const startAngle = i * SEGMENT_ANGLE + currentRotation;
            const endAngle = startAngle + SEGMENT_ANGLE;
            const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // Enhanced gradient fill
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, lightenColor(color.bg, 40));
            gradient.addColorStop(0.4, lightenColor(color.bg, 20));
            gradient.addColorStop(0.8, color.bg);
            gradient.addColorStop(1, darkenColor(color.bg, 15));
            ctx.fillStyle = gradient;
            ctx.fill();

            // Segment border with glow
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner segment highlight
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius * 0.95, startAngle + 0.02, endAngle - 0.02);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw hero icon/emoji and text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + SEGMENT_ANGLE / 2);

            // Hero name
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = color.text;
            ctx.font = 'bold 13px "Inter", system-ui, sans-serif';

            // Add text shadow for readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            const heroName = SUPERHEROES[i];
            const displayName = heroName.length > 11 ? heroName.substring(0, 9) + '...' : heroName;
            ctx.fillText(displayName, radius - 18, 0);

            // Hero emoji based on name
            ctx.textAlign = 'center';
            ctx.font = '16px sans-serif';
            ctx.fillText(getHeroEmoji(heroName), radius - 65, 0);

            ctx.restore();
        }

        // Inner circle with premium gradient
        const innerGradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 0, centerX, centerY, 50);
        innerGradient.addColorStop(0, '#A855F7');
        innerGradient.addColorStop(0.5, '#8B5CF6');
        innerGradient.addColorStop(1, '#6D28D9');

        // Inner circle shadow
        ctx.save();
        ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
        ctx.fillStyle = innerGradient;
        ctx.fill();
        ctx.restore();

        // Inner circle border
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner ring detail
        ctx.beginPath();
        ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center icon/text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎰', centerX, centerY - 8);
        ctx.font = 'bold 12px "Inter", system-ui, sans-serif';
        ctx.fillText('ÇEVİR', centerX, centerY + 10);

        // Draw modern pointer with glow
        drawPointer(ctx, centerX, centerY, radius);
    }, []);

    // Modern pointer drawing
    const drawPointer = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
        ctx.save();

        // Pointer glow
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 15;

        ctx.translate(centerX + radius + 15, centerY);

        // Pointer shape - more modern arrow
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-30, 0);
        ctx.lineTo(0, 18);
        ctx.closePath();

        // Pointer gradient
        const pointerGradient = ctx.createLinearGradient(0, -18, 0, 18);
        pointerGradient.addColorStop(0, '#FBBF24');
        pointerGradient.addColorStop(0.5, '#F59E0B');
        pointerGradient.addColorStop(1, '#D97706');
        ctx.fillStyle = pointerGradient;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner triangle highlight
        ctx.beginPath();
        ctx.moveTo(-3, -10);
        ctx.lineTo(-18, 0);
        ctx.lineTo(-3, 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        ctx.restore();
    };

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size with higher resolution for retina displays
        // Responsive size based on screen width - significantly larger
        const isMobile = window.innerWidth < 640;
        const isTablet = window.innerWidth < 1024;
        let baseSize = 480; // Increased from 380
        if (isMobile) baseSize = Math.min(320, window.innerWidth - 20);
        else if (isTablet) baseSize = Math.min(400, window.innerWidth - 40);

        const size = baseSize;
        const scale = window.devicePixelRatio || 1;
        canvas.width = size * scale;
        canvas.height = size * scale;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(scale, scale);

        drawWheel(ctx, rotation);
    }, [rotation, drawWheel]);

    // Animation function
    const spin = () => {
        if (disabled || spinning) return;

        setSpinning(true);
        setSelectedHero(null);

        // Random number of full rotations (5-10) plus random offset
        const fullRotations = 5 + Math.random() * 5;
        const randomOffset = Math.random() * 2 * Math.PI;
        const targetRotation = rotation + fullRotations * 2 * Math.PI + randomOffset;

        const duration = 4000 + Math.random() * 2000; // 4-6 seconds
        const startTime = performance.now();
        const startRotation = rotation;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: cubic ease-out for realistic deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (targetRotation - startRotation) * eased;

            setRotation(currentRotation);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Spin complete - calculate selected hero
                const normalizedRotation = currentRotation % (2 * Math.PI);
                // The pointer is on the right side, so we need to calculate which segment it points to
                const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
                const segmentIndex = Math.floor(pointerAngle / SEGMENT_ANGLE) % SEGMENT_COUNT;
                const hero = SUPERHEROES[segmentIndex];

                setSelectedHero(hero);
                setSpinning(false);
                onSpinComplete(hero);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 overflow-visible">
            {/* Wheel container with hover effect */}
            <div className="relative group overflow-visible">
                <canvas
                    ref={canvasRef}
                    className={`cursor-pointer transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:scale-[1.02]'}`}
                    onClick={spin}
                />

                {/* Spinning overlay */}
                {isCurrentlySpinning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3">
                            <div className="text-white text-base sm:text-xl font-bold animate-pulse flex items-center gap-2">
                                <span className="animate-spin">🎰</span>
                                Dönüyor...
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected hero display */}
            {selectedHero && !isCurrentlySpinning && (
                <div className="text-center animate-fade-in bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3 sm:py-4 border border-purple-500/30">
                    <div className="text-xs sm:text-sm text-purple-300 mb-1">🎉 Kazandınız:</div>
                    <div className="text-xl sm:text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                        {selectedHero}
                    </div>
                </div>
            )}

            {/* Spin button */}
            <button
                onClick={spin}
                disabled={disabled || spinning}
                className={`
                    relative px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg transition-all duration-300 transform overflow-hidden
                    ${disabled || spinning
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50'
                    }
                `}
            >
                {/* Button shine effect */}
                {!disabled && !spinning && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                )}
                <span className="relative z-10">
                    {spinning ? '🎰 Dönüyor...' : disabled ? '⬆️ Foto Yükle' : '🎲 Çarkı Çevir!'}
                </span>
            </button>

            {/* Instructions - hidden on mobile to save space */}
            {!disabled && !spinning && !selectedHero && (
                <p className="hidden sm:block text-gray-400 text-sm text-center max-w-xs">
                    Çarka tıklayın veya butona basın. Şans sizinle olsun! 🍀
                </p>
            )}
        </div>
    );
}

// Get emoji for hero
function getHeroEmoji(hero: string): string {
    const emojiMap: Record<string, string> = {
        'Spider-Man': '🕷️',
        'Iron Man': '🤖',
        'Captain America': '🛡️',
        'Thor': '⚡',
        'Hulk': '💪',
        'Black Panther': '🐆',
        'Doctor Strange': '🔮',
        'Wolverine': '🐺',
        'Deadpool': '💀',
        'Black Widow': '🕸️',
        'Scarlet Witch': '🔴',
        'Captain Marvel': '⭐',
        'Ant-Man': '🐜',
        'Vision': '💎',
        'Hawkeye': '🏹',
        'Star-Lord': '🎧',
    };
    return emojiMap[hero] || '🦸';
}

// Utility function to lighten a color
function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Utility function to darken a color
function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
