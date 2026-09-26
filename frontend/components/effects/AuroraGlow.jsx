'use client';

import React from 'react';

/**
 * AuroraGlow Effect
 * Atmospheric backdrop lighting creating Netflix-style cinematic stage ambiance.
 */
export default function AuroraGlow({
  primaryColor = '#E50914', // Netflix Red
  secondaryColor = '#F59E0B', // Amber Gold
  opacity = 0.12,
}) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full blur-[140px]"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 60%, transparent 100%)`,
          opacity,
        }}
      />
    </div>
  );
}
