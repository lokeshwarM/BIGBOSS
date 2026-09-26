'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Heart, Users } from 'lucide-react';

/**
 * NetflixPosterCard Effect
 * Authentic Netflix-style card with hover scale, red highlight, rank number, and metadata pill.
 */
export default function NetflixPosterCard({
  href,
  title,
  subtitle,
  imageUrl,
  rank,
  matchScore = 98,
  badgeText = 'ON AIR',
  accentColor = '#E50914',
}) {
  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-44 md:w-52 rounded-xl overflow-hidden bg-[#181818] border border-[#2A2A2A] hover:border-[#E50914] transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-[#E50914]/20 active:scale-95 block"
    >
      {/* Poster Image */}
      <div className="relative aspect-[16/10] w-full bg-[#111111] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          {badgeText && (
            <span className="bg-[#E50914] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow">
              {badgeText}
            </span>
          )}
        </div>

        {/* Rank Number (Netflix Top 10 style) */}
        {rank && (
          <div className="absolute bottom-1 right-2 text-3xl font-black font-mono text-white/30 group-hover:text-white/80 transition-colors drop-shadow">
            #{rank}
          </div>
        )}

        {/* Play / Vote Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-extrabold text-emerald-400 font-mono">{matchScore}% Trending</span>
          <span className="border border-gray-600 text-gray-400 px-1 rounded text-[8px] font-bold">13+</span>
        </div>

        <h4 className="font-bold text-xs text-white truncate group-hover:text-[#E50914] transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>
      </div>
    </Link>
  );
}
