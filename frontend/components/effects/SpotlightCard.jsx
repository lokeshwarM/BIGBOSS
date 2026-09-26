'use client';

import React, { useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * SpotlightCard Effect
 * Creates a dynamic radial spotlight gradient following pointer.
 * Adapts between Netflix Dark Red & Amazon Prime Video Cerulean Blue.
 */
export default function SpotlightCard({
  children,
  className = '',
}) {
  const { isLight } = useTheme();
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const spotlightColor = isLight ? 'rgba(0, 168, 225, 0.22)' : 'rgba(229, 9, 20, 0.18)';

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isLight
          ? 'bg-white/95 border-[#D0E4F7] text-[#0F172A] shadow-xl shadow-sky-900/5 hover:border-[#00A8E1]'
          : 'bg-[#181818] border-[#2A2A2A] text-white hover:border-[#E50914]/50'
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
