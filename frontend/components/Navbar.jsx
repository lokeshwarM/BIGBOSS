'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, ShieldCheck, Settings } from 'lucide-react';

const REGIONAL_SHOWS = [
  { slug: 'telugu', name: 'Telugu', color: '#3B82F6' },
  { slug: 'tamil', name: 'Tamil', color: '#EC4899' },
  { slug: 'hindi', name: 'Hindi', color: '#F59E0B' },
  { slug: 'kannada', name: 'Kannada', color: '#10B981' },
  { slug: 'malayalam', name: 'Malayalam', color: '#8B5CF6' },
  { slug: 'marathi', name: 'Marathi', color: '#F97316' },
  { slug: 'bangla', name: 'Bangla', color: '#06B6D4' },
];

export default function Navbar({ deviceAccount, onOpenAccountModal }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1E293B]">
      {/* Top Bar */}
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-lg tracking-wider text-white">HOUSE<span className="text-amber-400">PULSE</span></span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">1 Vote/Day • Zero Sign-in Wall</p>
          </div>
        </Link>

        {/* Right Actions: Admin Link + Anonymous User Badge */}
        <div className="flex items-center space-x-2">
          <Link
            href="/admin"
            className={`p-1.5 rounded-full border transition-all ${
              pathname?.startsWith('/admin')
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-[#131B2E] border-[#1E293B] text-gray-400 hover:text-white hover:border-gray-600'
            }`}
            title="Admin Portal"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <button
            onClick={onOpenAccountModal}
            className="flex items-center space-x-1.5 bg-[#131B2E] border border-[#1E293B] hover:border-amber-500/50 py-1 px-2.5 rounded-full transition-all active:scale-95"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
              style={{ backgroundColor: deviceAccount?.color || '#F59E0B' }}
            >
              {deviceAccount?.nickname?.[0] || 'U'}
            </div>
            <span className="text-xs font-semibold text-gray-200 max-w-[70px] truncate">
              {deviceAccount?.nickname || 'Guest'}
            </span>
          </button>
        </div>
      </div>

      {/* Language Selector Horizontal Scroll Tabs */}
      <div className="max-w-md mx-auto px-4 pb-2.5 overflow-x-auto no-scrollbar flex space-x-2 scroll-smooth">
        {REGIONAL_SHOWS.map((show) => {
          const isActive = pathname?.startsWith(`/${show.slug}`);
          return (
            <Link
              key={show.slug}
              href={`/${show.slug}`}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold scale-[1.02]'
                  : 'bg-[#131B2E] text-gray-300 border border-[#1E293B] hover:text-white hover:bg-[#1B2640]'
              }`}
            >
              {show.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
