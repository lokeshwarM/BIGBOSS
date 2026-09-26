'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * NetflixPosterCard Effect
 * Adapts between Netflix Dark and Amazon Prime Video Light Gradient themes.
 */
export default function NetflixPosterCard({
  href,
  title,
  subtitle,
  imageUrl,
  rank,
  matchScore = 98,
  badgeText = 'ON AIR',
}) {
  const { isLight } = useTheme();

  return (
    <Link
      href={href}
      className={`group relative flex-shrink-0 w-44 md:w-52 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 hover:z-20 active:scale-95 block ${
        isLight
          ? 'bg-white border-[#D0E4F7] hover:border-[#00A8E1] hover:shadow-2xl hover:shadow-sky-500/20 text-[#0F172A]'
          : 'bg-[#181818] border-[#2A2A2A] hover:border-[#E50914] hover:shadow-2xl hover:shadow-[#E50914]/20 text-white'
      }`}
    >
      {/* Poster Image */}
      <div className="relative aspect-[16/10] w-full bg-black/40 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isLight
              ? 'from-white via-white/10 to-transparent'
              : 'from-[#181818] via-black/20 to-transparent'
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          {badgeText && (
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow ${
                isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white'
                  : 'bg-[#E50914] text-white'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Rank Number */}
        {rank && (
          <div
            className={`absolute bottom-1 right-2 text-3xl font-black font-mono transition-colors drop-shadow ${
              isLight ? 'text-gray-400/40 group-hover:text-[#00A8E1]' : 'text-white/30 group-hover:text-white/80'
            }`}
          >
            #{rank}
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-extrabold text-emerald-500 font-mono">{matchScore}% Trending</span>
          <span className={`border px-1 rounded text-[8px] font-bold ${isLight ? 'border-sky-200 text-sky-800 bg-sky-50' : 'border-gray-600 text-gray-400'}`}>
            13+
          </span>
        </div>

        <h4
          className={`font-bold text-xs truncate transition-colors ${
            isLight ? 'text-[#0F172A] group-hover:text-[#00A8E1]' : 'text-white group-hover:text-[#E50914]'
          }`}
        >
          {title}
        </h4>
        <p className={`text-[10px] truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      </div>
    </Link>
  );
}
