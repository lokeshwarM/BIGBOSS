'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AuroraGlow Effect
 * Adapts dynamically:
 * - Dark: Netflix Cinematic Red / Amber
 * - Light: Amazon Prime Video Electric Cyan / Royal Blue Gradient
 */
export default function AuroraGlow({
  opacity,
}) {
  const { isLight } = useTheme();

  const primaryColor = isLight ? '#00A8E1' : '#E50914';
  const secondaryColor = isLight ? '#0073B1' : '#B81D24';
  const activeOpacity = opacity !== undefined ? opacity : (isLight ? 0.22 : 0.14);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-700">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[500px] rounded-full blur-[140px] transition-all duration-700"
        style={{
          background: isLight
            ? `radial-gradient(circle, ${primaryColor} 0%, #BAE6FD 50%, transparent 80%)`
            : `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 60%, transparent 100%)`,
          opacity: activeOpacity,
        }}
      />
    </div>
  );
}
