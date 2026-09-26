'use client';

import React, { useEffect, useState } from 'react';

/**
 * CountUp Effect
 * Smooth rolling number ticker for vote tallies and stats.
 */
export default function CountUp({
  to = 0,
  from = 0,
  duration = 1.2,
  separator = ',',
  className = '',
}) {
  const [current, setCurrent] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out expo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = Math.floor(from + (to - from) * easeOut);
      setCurrent(val);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(to);
      }
    };

    window.requestAnimationFrame(step);
  }, [to, from, duration]);

  const formatted = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return <span className={className}>{formatted}</span>;
}
