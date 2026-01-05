'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const HERO_NAMES = ['Spider-Man', 'Iron Man', 'Thor', 'Hulk', 'Deadpool', 'Doctor Strange'];

export default function HomePage() {
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % HERO_NAMES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 overflow-hidden">
      {/* Animated background effects - smaller on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[200px] sm:w-[400px] md:w-[500px] h-[200px] sm:h-[400px] md:h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[150px] sm:w-[300px] md:w-[400px] h-[150px] sm:h-[300px] md:h-[400px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[600px] md:h-[800px] bg-blue-500/10 rounded-full blur-3xl" />

        {/* Floating particles - hidden on mobile */}
        <div className="hidden sm:block absolute top-20 left-20 w-4 h-4 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="hidden sm:block absolute top-40 right-32 w-3 h-3 bg-pink-400/30 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="hidden sm:block absolute bottom-32 left-1/3 w-5 h-5 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Superhero Wheel
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center py-8 sm:py-0">
          {/* Main Title */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Süper Kahramana
              </span>
              <br />
              <span className="text-white">Dönüş!</span>
            </h1>

            {/* Dynamic Hero Name */}
            <div className="h-10 sm:h-16 flex items-center justify-center">
              <p className="text-lg sm:text-2xl md:text-3xl text-gray-300">
                Bugün{' '}
                <span
                  key={currentHero}
                  className="inline-block font-bold text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text animate-fade-in"
                >
                  {HERO_NAMES[currentHero]}
                </span>
                {' '}ol!
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mb-8 sm:mb-12 animate-slide-up px-4" style={{ animationDelay: '0.2s' }}>
            Fotoğrafını yükle, çarkı çevir ve AI ile süper kahramana dönüş!
            Tamamen ücretsiz! 🚀
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/wheel"
              className="group relative inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-95"
            >
              {/* Button shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Ücretsiz Başla
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-10 sm:mt-20 max-w-4xl w-full animate-slide-up px-2" style={{ animationDelay: '0.6s' }}>
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6 text-center hover:border-purple-500/50 transition-colors">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">📸</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Fotoğraf Yükle</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Herhangi bir fotoğrafını yükle</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6 text-center hover:border-pink-500/50 transition-colors">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🎰</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Çarkı Çevir</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Hangi kahraman olacağını şansa bırak</p>
            </div>
            <div className="bg-gray-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50 p-4 sm:p-6 text-center hover:border-blue-500/50 transition-colors">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">✨</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Dönüşümünü Al</h3>
              <p className="text-gray-400 text-xs sm:text-sm">AI ile süper kahramana dönüş</p>
            </div>
          </div>
        </main>

        {/* Brand Footer */}
        <footer className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
          <div className="mb-3 sm:mb-4">
            <p className="text-xl sm:text-3xl md:text-4xl font-bold text-white">
              Bu bir{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Utkan Tunalı
              </span>
              {' '}markasıdır
            </p>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            Powered by Local AI • Made with ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
