import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Superhero Wheel | Transform Yourself into a Superhero',
  description: 'Upload your photo, spin the wheel, and transform yourself into your favorite superhero using AI! Powered by Pollinations.',
  keywords: ['superhero', 'AI', 'image generator', 'photo transformation', 'Marvel', 'Pollinations'],
  authors: [{ name: 'Superhero Wheel' }],
  openGraph: {
    title: 'Superhero Wheel | Transform Yourself into a Superhero',
    description: 'Upload your photo, spin the wheel, and become a superhero!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
