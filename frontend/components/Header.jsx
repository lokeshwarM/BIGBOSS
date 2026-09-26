'use client';

import React from 'react';
import { Flame, User, Bell } from 'lucide-react';

export default function Header({ shows, selectedShow, onSelectShow, deviceAccount, onOpenAccountModal }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1E293B]">
      {/* Top Bar */}
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
            <p className="text-[10px] text-gray-400 font-medium">Unofficial Fan Vote • 1 Vote/Day</p>
          </div>
        </div>

        {/* Anonymous User Badge */}
        <button
          onClick={onOpenAccountModal}
          className="flex items-center space-x-2 bg-[#131B2E] border border-[#1E293B] hover:border-amber-500/50 py-1.5 px-3 rounded-full transition-all active:scale-95"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
            style={{ backgroundColor: deviceAccount?.color || '#F59E0B' }}
          >
            {deviceAccount?.nickname?.[0] || 'U'}
          </div>
          <span className="text-xs font-semibold text-gray-200 max-w-[80px] truncate">
            {deviceAccount?.nickname || 'Guest'}
          </span>
        </button>
      </div>

      {/* Language Selector Horizontal Scroll Tabs */}
      <div className="max-w-md mx-auto px-4 pb-2.5 overflow-x-auto no-scrollbar flex space-x-2 scroll-smooth">
        {shows?.map((show) => {
          const isSelected = selectedShow?.slug === show.slug;
          return (
            <button
              key={show.slug}
              onClick={() => onSelectShow(show)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 font-bold scale-[1.02]'
                  : 'bg-[#131B2E] text-gray-300 border border-[#1E293B] hover:text-white hover:bg-[#1B2640]'
              }`}
            >
              {show.language}
            </button>
          );
        })}
      </div>
    </header>
  );
}
