'use client';

import React, { useState } from 'react';
import { Users, UserX, Award, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ContestantRoster({ contestants = [] }) {
  const { isLight } = useTheme();
  const [filter, setFilter] = useState('all'); // 'all', 'in_house', 'evicted'

  const safeContestants = Array.isArray(contestants) ? contestants : [];

  if (safeContestants.length === 0) {
    return (
      <div
        className={`rounded-2xl p-6 text-center text-xs border ${
          isLight
            ? 'bg-white/95 border-[#D0E4F7] text-gray-600 shadow-md'
            : 'bg-[#181818] border-[#2A2A2A] text-gray-400'
        }`}
      >
        <Users className={`w-8 h-8 mx-auto mb-2 ${isLight ? 'text-[#00A8E1]' : 'text-[#E50914]'}`} />
        <p className="font-bold">No contestants added to this season yet.</p>
        <p className="text-[11px] text-gray-500 mt-1">Add housemates from the Studio Admin panel.</p>
      </div>
    );
  }

  const inHouseCount = safeContestants.filter((c) => c.status === 'in_house').length;
  const evictedCount = safeContestants.filter((c) => c.status === 'evicted').length;

  const filteredContestants = safeContestants.filter((c) => {
    if (filter === 'in_house') return c.status === 'in_house';
    if (filter === 'evicted') return c.status === 'evicted';
    return true;
  });

  return (
    <div
      className={`rounded-2xl p-4 border transition-all space-y-4 ${
        isLight
          ? 'bg-gradient-to-b from-white to-[#F4F9FF] border-[#CDE5FA] shadow-lg shadow-sky-900/5'
          : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
      }`}
    >
      {/* Header with Title and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Users className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-xs sm:text-sm font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Season Contestants
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLight ? 'bg-sky-100 text-sky-800' : 'bg-white/10 text-gray-300'
            }`}
          >
            {safeContestants.length} Housemates
          </span>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center space-x-1 text-[11px] font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'all'
                ? isLight
                  ? 'bg-[#0073B1] text-white shadow-sm'
                  : 'bg-[#E50914] text-white'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All ({safeContestants.length})
          </button>
          <button
            onClick={() => setFilter('in_house')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === 'in_house'
                ? isLight
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-600 text-white'
                : isLight
                ? 'text-emerald-700 hover:bg-emerald-50'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            In House ({inHouseCount})
          </button>
          {evictedCount > 0 && (
            <button
              onClick={() => setFilter('evicted')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'evicted'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              Evicted ({evictedCount})
            </button>
          )}
        </div>
      </div>

      {/* Grid of Large Portrait Contestant Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredContestants.map((c) => {
          const isEvicted = c.status === 'evicted';
          const isWinner = c.status === 'winner';

          return (
            <div
              key={c.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.03] shadow-md ${
                isEvicted
                  ? isLight
                    ? 'bg-slate-100 border-red-200 opacity-80'
                    : 'bg-[#121212] border-red-900/40 opacity-75'
                  : isLight
                  ? 'bg-white border-[#CDE5FA] hover:border-[#00A8E1] hover:shadow-sky-500/20'
                  : 'bg-[#141414] border-[#2A2A2A] hover:border-[#E50914] hover:shadow-[#E50914]/20'
              }`}
            >
              {/* Full Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
                <img
                  src={
                    c.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={c.name}
                  className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                    isEvicted ? 'grayscale contrast-125' : ''
                  }`}
                  loading="lazy"
                />

                {/* Status Badges Overlay (Top) */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                  {isWinner ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow-md">
                      <Award className="w-3 h-3 fill-black" />
                      <span>Winner</span>
                    </span>
                  ) : isEvicted ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-600/90 backdrop-blur-md text-white font-black text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow-md">
                      <UserX className="w-3 h-3" />
                      <span>Evicted</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-black text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>In House</span>
                    </span>
                  )}
                </div>

                {/* Eviction stamp overlay */}
                {isEvicted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-red-500 text-red-400 font-black text-xs uppercase px-2.5 py-1 rotate-[-12deg] rounded-md tracking-widest bg-black/70 backdrop-blur-sm shadow-xl">
                      EVICTED
                    </div>
                  </div>
                )}

                {/* Dark Vignette / Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

                {/* Info Text Overlay at the Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-0.5 text-white">
                  <h4 className="font-black text-xs sm:text-sm leading-tight truncate drop-shadow-md text-white">
                    {c.name}
                  </h4>

                  {c.native_name && (
                    <p className="text-[10px] font-semibold text-gray-300 truncate drop-shadow">
                      {c.native_name}
                    </p>
                  )}

                  <p
                    className={`text-[10px] font-bold truncate pt-0.5 ${
                      isEvicted
                        ? 'text-red-300'
                        : isLight
                        ? 'text-sky-300'
                        : 'text-red-400'
                    }`}
                  >
                    {c.occupation || 'Housemate'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
