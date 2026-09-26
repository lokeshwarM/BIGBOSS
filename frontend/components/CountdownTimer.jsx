'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';

export default function CountdownTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });

  useEffect(() => {
    function calculateTime() {
      // Default to next Friday 11:59:59 PM if endsAt not provided
      const target = endsAt ? new Date(endsAt).getTime() : Date.now() + 2 * 86400000;
      const difference = target - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isClosed: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isClosed) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-center space-x-2 text-red-400">
        <ShieldAlert className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Voting Closed For This Week</span>
      </div>
    );
  }

  return (
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-3.5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-amber-400">
          <Clock className="w-4 h-4 animate-spin-slow" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Poll Closes Friday Night</span>
        </div>
        <span className="text-[10px] text-gray-400">Synced with TV Broadcast</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#0B0F19] rounded-xl py-2 px-1 border border-[#1E293B]">
          <span className="block text-lg font-black text-white leading-none font-mono">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Days</span>
        </div>
        <div className="bg-[#0B0F19] rounded-xl py-2 px-1 border border-[#1E293B]">
          <span className="block text-lg font-black text-white leading-none font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Hours</span>
        </div>
        <div className="bg-[#0B0F19] rounded-xl py-2 px-1 border border-[#1E293B]">
          <span className="block text-lg font-black text-white leading-none font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Mins</span>
        </div>
        <div className="bg-[#0B0F19] rounded-xl py-2 px-1 border border-[#1E293B]">
          <span className="block text-lg font-black text-amber-400 leading-none font-mono">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Secs</span>
        </div>
      </div>
    </div>
  );
}
