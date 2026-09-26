'use client';

import React from 'react';
import { Users, UserX, Award } from 'lucide-react';

export default function ContestantRoster({ contestants }) {
  if (!contestants || contestants.length === 0) {
    return (
      <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-5 text-center text-xs text-gray-400">
        <Users className="w-6 h-6 mx-auto mb-2 text-gray-500" />
        No contestants added to this season yet. Add them from the Admin panel!
      </div>
    );
  }

  return (
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-amber-400">
          <Users className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Season Contestants</h3>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">
          {contestants.length} Housemates
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {contestants.map((c) => (
          <div
            key={c.id}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
              c.status === 'evicted'
                ? 'bg-[#0B0F19]/60 border-red-500/20 opacity-75'
                : 'bg-[#0B0F19] border-[#1E293B]'
            }`}
          >
            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-900 border border-[#1E293B] flex-shrink-0">
              <img
                src={c.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={c.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              {c.status === 'evicted' && (
                <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-white truncate">{c.name}</span>
              {c.native_name && (
                <span className="block text-[10px] text-gray-400 truncate">{c.native_name}</span>
              )}
              <span className="block text-[9px] text-amber-400/90 truncate mt-0.5">{c.occupation || 'Contestant'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
