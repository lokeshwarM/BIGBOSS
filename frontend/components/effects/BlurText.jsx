'use client';

import React, { useEffect, useState } from 'react';

/**
 * BlurText Effect
 * Staggered cinematic blur-in effect for impactful titles.
 */
export default function BlurText({
  text = '',
  delay = 50,
  className = '',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const words = text.split(' ');

  return (
    <span className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            filter: mounted ? 'blur(0px)' : 'blur(8px)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
