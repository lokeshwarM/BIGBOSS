'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { PulseGlowBadge } from './effects';
import { useTheme } from '../context/ThemeContext';

export default function CountdownTimer({ endsAt }) {
  const { isLight } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false,
  });

  useEffect(() => {
    function calculateTime() {
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
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-center space-x-2 text-red-500">
        <ShieldAlert className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Voting Closed For This Week</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-3.5 border transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white via-white to-[#F0F7FF] border-[#CDE5FA] shadow-md shadow-sky-900/5'
          : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`flex items-center space-x-1.5 ${
            isLight ? 'text-[#0073B1]' : 'text-[#E50914]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-wider">Poll Closes Friday Night</span>
        </div>
        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          TV Broadcast Synced
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div
          className={`rounded-xl py-2 px-1 border transition-colors ${
            isLight ? 'bg-[#EBF5FE] border-[#CDE5FA]' : 'bg-black border-[#2A2A2A]'
          }`}
        >
          <span
            className={`block text-lg font-black leading-none font-mono ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider ${
              isLight ? 'text-sky-800/70' : 'text-gray-500'
            }`}
          >
            Days
          </span>
        </div>

        <div
          className={`rounded-xl py-2 px-1 border transition-colors ${
            isLight ? 'bg-[#EBF5FE] border-[#CDE5FA]' : 'bg-black border-[#2A2A2A]'
          }`}
        >
          <span
            className={`block text-lg font-black leading-none font-mono ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider ${
              isLight ? 'text-sky-800/70' : 'text-gray-500'
            }`}
          >
            Hours
          </span>
        </div>

        <div
          className={`rounded-xl py-2 px-1 border transition-colors ${
            isLight ? 'bg-[#EBF5FE] border-[#CDE5FA]' : 'bg-black border-[#2A2A2A]'
          }`}
        >
          <span
            className={`block text-lg font-black leading-none font-mono ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider ${
              isLight ? 'text-sky-800/70' : 'text-gray-500'
            }`}
          >
            Mins
          </span>
        </div>

        <div
          className={`rounded-xl py-2 px-1 border transition-colors ${
            isLight ? 'bg-[#EBF5FE] border-[#CDE5FA]' : 'bg-black border-[#2A2A2A]'
          }`}
        >
          <span
            className={`block text-lg font-black leading-none font-mono ${
              isLight ? 'text-[#00A8E1]' : 'text-[#E50914]'
            }`}
          >
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider ${
              isLight ? 'text-sky-800/70' : 'text-gray-500'
            }`}
          >
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}

