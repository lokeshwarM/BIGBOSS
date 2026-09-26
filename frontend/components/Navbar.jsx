'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Settings } from 'lucide-react';
import { PulseGlowBadge } from './effects';

const REGIONAL_SHOWS = [
  { slug: 'telugu', name: 'Telugu' },
  { slug: 'tamil', name: 'Tamil' },
  { slug: 'hindi', name: 'Hindi' },
  { slug: 'kannada', name: 'Kannada' },
  { slug: 'malayalam', name: 'Malayalam' },
  { slug: 'marathi', name: 'Marathi' },
  { slug: 'bangla', name: 'Bangla' },
];

export default function Navbar({ deviceAccount, onOpenAccountModal }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#141414]/90 backdrop-blur-md border-b border-[#222222] transition-colors">
      {/* Top Header Row */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Netflix Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-md bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/25 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-black text-xl tracking-wider text-white">
                HOUSE<span className="text-[#E50914]">PULSE</span>
              </span>
            </div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mt-0.5">
              Bigg Boss Fan Hub
            </span>
          </div>
        </Link>

        {/* Right Action Icons: Live Badge + Admin + Profile Avatar */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block">
            <PulseGlowBadge text="LIVE POLLS" color="#E50914" />
          </div>

          <Link
            href="/admin"
            className={`p-2 rounded-lg border transition-all ${
              pathname?.startsWith('/admin')
                ? 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#E50914]/50'
            }`}
            title="Admin Management"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Netflix Style Profile Avatar Box */}
          <button
            onClick={onOpenAccountModal}
            className="flex items-center space-x-2 bg-[#181818] border border-[#2A2A2A] hover:border-white/40 p-1 pr-2.5 rounded-lg transition-all active:scale-95"
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-black text-white shadow"
              style={{ backgroundColor: deviceAccount?.color || '#E50914' }}
            >
              {deviceAccount?.nickname?.[0] || 'U'}
            </div>
            <span className="text-xs font-bold text-gray-200 max-w-[80px] truncate hidden xs:inline-block">
              {deviceAccount?.nickname || 'Guest'}
            </span>
          </button>
        </div>
      </div>

      {/* Netflix Horizontal Language Navigation Rail */}
      <div className="max-w-4xl mx-auto px-4 pb-2.5 overflow-x-auto no-scrollbar flex space-x-2">
        <Link
          href="/"
          className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            pathname === '/'
              ? 'bg-white text-black font-extrabold scale-[1.02] shadow-sm'
              : 'bg-[#181818] text-gray-300 border border-[#2A2A2A] hover:text-white hover:bg-[#252525]'
          }`}
        >
          All Shows
        </Link>
        {REGIONAL_SHOWS.map((show) => {
          const isActive = pathname?.startsWith(`/${show.slug}`);
          return (
            <Link
              key={show.slug}
              href={`/${show.slug}`}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30 font-extrabold scale-[1.02]'
                  : 'bg-[#181818] text-gray-300 border border-[#2A2A2A] hover:text-white hover:bg-[#252525]'
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
