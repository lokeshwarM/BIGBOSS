'use client';

import React from 'react';
import { Users, UserX, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ContestantRoster({ contestants }) {
  const { isLight } = useTheme();

  if (!contestants || contestants.length === 0) {
    return (
      <div
        className={`rounded-2xl p-5 text-center text-xs border ${
          isLight
            ? 'bg-white/95 border-[#D0E4F7] text-gray-600 shadow-md'
            : 'bg-[#181818] border-[#2A2A2A] text-gray-400'
        }`}
      >
        <Users className={`w-6 h-6 mx-auto mb-2 ${isLight ? 'text-[#00A8E1]' : 'text-gray-500'}`} />
        No contestants added to this season yet. Add them from the Admin panel!
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white to-[#F4F9FF] border-[#CDE5FA] shadow-lg shadow-sky-900/5'
          : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Season Contestants
          </h3>
        </div>
        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          {contestants.length} Housemates
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {contestants.map((c) => (
          <div
            key={c.id}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all ${
              c.status === 'evicted'
                ? isLight
                  ? 'bg-red-50/70 border-red-200 opacity-75'
                  : 'bg-red-950/20 border-red-500/20 opacity-75'
                : isLight
                ? 'bg-white border-[#D0E4F7] hover:border-[#00A8E1] shadow-sm'
                : 'bg-[#121212] border-[#2A2A2A] hover:border-gray-600'
            }`}
          >
            <div
              className={`relative w-11 h-11 rounded-lg overflow-hidden border flex-shrink-0 ${
                isLight ? 'border-sky-100 bg-sky-50' : 'border-[#2A2A2A] bg-black'
              }`}
            >
              <img
                src={c.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={c.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              {c.status === 'evicted' && (
                <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`block text-xs font-bold truncate ${
                  isLight ? 'text-[#0F172A]' : 'text-white'
                }`}
              >
                {c.name}
              </span>
              {c.native_name && (
                <span className={`block text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  {c.native_name}
                </span>
              )}
              <span
                className={`block text-[9px] truncate mt-0.5 font-medium ${
                  isLight ? 'text-[#0073B1]' : 'text-gray-400'
                }`}
              >
                {c.occupation || 'Contestant'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

