'use client';

import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, UserX, CheckCircle } from 'lucide-react';

export default function ArchiveSection({ archiveWeeks }) {
  const [expandedWeekId, setExpandedWeekId] = useState(archiveWeeks?.[0]?.id || null);

  if (!archiveWeeks || archiveWeeks.length === 0) {
    return null;
  }

  const toggleWeek = (id) => {
    setExpandedWeekId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 shadow-lg shadow-black/40">
      <div className="flex items-center space-x-2 text-amber-400 mb-3">
        <History className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Previous Weeks Archive</h3>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Official eviction results and completed fan poll final standings.
      </p>

      <div className="space-y-2.5">
        {archiveWeeks.map((week) => {
          const isExpanded = expandedWeekId === week.id;
          const evictedContestant = week.nominees?.find((n) => n.is_evicted);

          return (
            <div
              key={week.id}
              className="bg-[#0B0F19] border border-[#1E293B] rounded-xl overflow-hidden transition-all"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-[#18233C]/50 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-white">Week {week.week_number}</span>
                    {evictedContestant ? (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                        <UserX className="w-2.5 h-2.5" />
                        <span>Evicted: {evictedContestant.name.split(' ')[0]}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        No Eviction
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{week.title}</p>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-3 pt-0 border-t border-[#1E293B] space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 pb-1">
                    <span>Final Fan Voting Results:</span>
                    <span>{week.total_votes?.toLocaleString()} Total Votes</span>
                  </div>

                  {week.nominees?.map((nominee) => (
                    <div
                      key={nominee.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        nominee.is_evicted
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-[#131B2E] border-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-900 border border-[#1E293B]">
                          <img
                            src={nominee.photo_url}
                            alt={nominee.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{nominee.name}</span>
                            {nominee.is_evicted && (
                              <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                                EVICTED
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {nominee.vote_count?.toLocaleString()} votes
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400 font-mono">
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
