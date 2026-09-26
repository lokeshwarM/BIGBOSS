'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Settings, Sun, Moon } from 'lucide-react';
import { PulseGlowBadge } from './effects';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme, isLight } = useTheme();

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 border-b ${
        isLight
          ? 'bg-white/85 border-[#D0E4F7] shadow-sm shadow-blue-500/5'
          : 'bg-[#141414]/90 border-[#222222]'
      }`}
    >
      {/* Top Header Row */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo (Netflix Red in Dark, Prime Cyan in Light) */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
              isLight
                ? 'bg-gradient-to-tr from-[#00A8E1] to-[#0073B1] shadow-[#00A8E1]/30'
                : 'bg-[#E50914] shadow-[#E50914]/25'
            }`}
          >
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span
                className={`font-black text-lg sm:text-xl tracking-wider ${
                  isLight ? 'text-[#0F172A]' : 'text-white'
                }`}
              >
                BIGBOSS <span className={isLight ? 'text-[#00A8E1]' : 'text-[#E50914]'}>Community</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Right Action Icons: Theme Switcher + Live Badge + Admin + Profile Avatar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button (Dark Theme <-> Light Theme) */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1.5 rounded-xl border transition-all duration-300 flex items-center space-x-1.5 active:scale-95 ${
              isLight
                ? 'bg-[#E3EFFF] border-[#B9DCFA] text-[#0073B1] hover:bg-[#D5E8FD] shadow-sm'
                : 'bg-[#181818] border-[#2A2A2A] text-amber-400 hover:text-amber-300 hover:border-amber-400/50'
            }`}
            title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {isLight ? (
              <>
                <Moon className="w-4 h-4 text-[#0073B1]" />
                <span className="text-[11px] font-bold text-[#0F172A]">Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold text-gray-200">Light Theme</span>
              </>
            )}
          </button>

          <div className="hidden sm:block">
            <PulseGlowBadge
              text="LIVE POLLS"
              color={isLight ? '#00A8E1' : '#E50914'}
            />
          </div>

          <Link
            href="/admin"
            className={`p-2 rounded-xl border transition-all ${
              pathname?.startsWith('/admin')
                ? isLight
                  ? 'bg-[#00A8E1] border-[#00A8E1] text-white shadow-md shadow-[#00A8E1]/30'
                  : 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                : isLight
                ? 'bg-white border-[#D0E4F7] text-gray-600 hover:text-[#00A8E1] hover:border-[#00A8E1]'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#E50914]/50'
            }`}
            title="Admin Management"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Profile Avatar Box */}
          <button
            onClick={onOpenAccountModal}
            className={`flex items-center space-x-1.5 p-1 pr-2.5 rounded-xl border transition-all active:scale-95 ${
              isLight
                ? 'bg-white border-[#D0E4F7] hover:border-[#00A8E1]'
                : 'bg-[#181818] border-[#2A2A2A] hover:border-white/40'
            }`}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shadow"
              style={{ backgroundColor: deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914') }}
            >
              {deviceAccount?.nickname?.[0] || 'U'}
            </div>
            <span
              className={`text-xs font-bold max-w-[80px] truncate hidden xs:inline-block ${
                isLight ? 'text-[#0F172A]' : 'text-gray-200'
              }`}
            >
              {deviceAccount?.nickname || 'Guest'}
            </span>
          </button>
        </div>
      </div>

      {/* Horizontal Language Navigation Rail */}
      <div className="max-w-4xl mx-auto px-4 pb-2.5 overflow-x-auto no-scrollbar flex space-x-2">
        <Link
          href="/"
          className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            pathname === '/'
              ? isLight
                ? 'bg-[#00A8E1] text-white font-extrabold shadow-md shadow-[#00A8E1]/25 scale-[1.02]'
                : 'bg-white text-black font-extrabold scale-[1.02] shadow-sm'
              : isLight
              ? 'bg-white text-gray-700 border border-[#D0E4F7] hover:text-[#00A8E1] hover:bg-sky-50'
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
              className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive
                  ? isLight
                    ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-md shadow-sky-500/25 font-extrabold scale-[1.02]'
                    : 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30 font-extrabold scale-[1.02]'
                  : isLight
                  ? 'bg-white text-gray-700 border border-[#D0E4F7] hover:text-[#00A8E1] hover:bg-sky-50'
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
