'use client';

import React from 'react';

/**
 * PulseGlowBadge Effect
 * Live TV broadcasting red beacon with animated radar ripples.
 */
export default function PulseGlowBadge({
  text = 'LIVE VOTE',
  color = '#E50914',
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-black/60 border ${className}`}
      style={{ borderColor: `${color}60` }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: color }}
        />
      </span>
      <span>{text}</span>
    </span>
  );
}
