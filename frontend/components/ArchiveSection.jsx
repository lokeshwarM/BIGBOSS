'use client';

import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, UserX, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ArchiveSection({ archiveWeeks }) {
  const { isLight } = useTheme();
  const [expandedWeekId, setExpandedWeekId] = useState(archiveWeeks?.[0]?.id || null);

  if (!archiveWeeks || archiveWeeks.length === 0) {
    return null;
  }

  const toggleWeek = (id) => {
    setExpandedWeekId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white to-[#F4F9FF] border-[#CDE5FA] shadow-lg shadow-sky-900/5'
          : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
      }`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <History className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
        <h3
          className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          Previous Weeks Archive
        </h3>
      </div>
      <p className={`text-[11px] mb-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
        Official eviction results and completed fan poll final standings.
      </p>

      <div className="space-y-2.5">
        {archiveWeeks.map((week) => {
          const isExpanded = expandedWeekId === week.id;
          const evictedContestant = week.nominees?.find((n) => n.is_evicted);

          return (
            <div
              key={week.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                isLight ? 'bg-white border-[#D0E4F7]' : 'bg-[#121212] border-[#2A2A2A]'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleWeek(week.id)}
                className={`w-full p-3 flex items-center justify-between text-left transition-colors ${
                  isLight ? 'hover:bg-sky-50/70' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-extrabold ${
                        isLight ? 'text-[#0F172A]' : 'text-white'
                      }`}
                    >
                      Week {week.week_number}
                    </span>
                    {evictedContestant ? (
                      <span className="text-[10px] bg-red-500/15 text-red-600 border border-red-500/25 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                        <UserX className="w-2.5 h-2.5" />
                        <span>Evicted: {evictedContestant.name.split(' ')[0]}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                        No Eviction
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    {week.title}
                  </p>
                </div>
                <div className={isLight ? 'text-slate-400' : 'text-gray-400'}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div
                  className={`p-3 pt-0 border-t space-y-2 mt-1 ${
                    isLight
                      ? 'bg-[#F8FAFD] border-[#D0E4F7]'
                      : 'bg-[#181818] border-[#2A2A2A]'
                  }`}
                >
                  <div className={`flex justify-between items-center text-[10px] pt-2 pb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    <span>Final Fan Voting Results:</span>
                    <span className="font-semibold">{week.total_votes?.toLocaleString()} Total Votes</span>
                  </div>

                  {week.nominees?.map((nominee) => (
                    <div
                      key={nominee.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                        nominee.is_evicted
                          ? isLight
                            ? 'bg-red-50/80 border-red-200'
                            : 'bg-red-500/10 border-red-500/30'
                          : isLight
                          ? 'bg-white border-[#D0E4F7] shadow-sm'
                          : 'bg-[#121212] border-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`relative w-8 h-8 rounded-lg overflow-hidden border ${
                            isLight ? 'border-sky-100 bg-sky-50' : 'border-[#2A2A2A] bg-black'
                          }`}
                        >
                          <img
                            src={nominee.photo_url}
                            alt={nominee.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-xs font-bold ${
                                isLight ? 'text-[#0F172A]' : 'text-white'
                              }`}
                            >
                              {nominee.name}
                            </span>
                            {nominee.is_evicted && (
                              <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                                EVICTED
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                            {nominee.vote_count?.toLocaleString()} votes
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-black font-mono ${
                            isLight ? 'text-[#0073B1]' : 'text-[#E50914]'
                          }`}
                        >
                          {nominee.vote_share?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

