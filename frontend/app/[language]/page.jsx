'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import DeviceAccountModal from '../../components/DeviceAccountModal';
import { fetchShowBySlug, fetchSeasonsByShow } from '../../lib/api';
import { getDeviceAccount } from '../../lib/device';
import { Tv, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function LanguageShowPage() {
  const params = useParams();
  const language = params?.language || 'telugu';

  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());

    Promise.all([
      fetchShowBySlug(language).catch(() => null),
      fetchSeasonsByShow(language).catch(() => []),
    ]).then(([showData, seasonsData]) => {
      setShow(showData);
      setSeasons(seasonsData || []);
      setIsLoading(false);
    });
  }, [language]);

  const ongoingSeason = seasons.find((s) => s.status === 'ongoing') || seasons[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Show Banner */}
        <div className="bg-gradient-to-br from-[#18233C] to-[#131B2E] border border-[#1E293B] rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Tv className="w-4 h-4" />
            <span>{show?.language || language} Reality Hub</span>
          </div>

          <h1 className="text-xl font-black text-white">{show?.name || `Bigg Boss ${language.toUpperCase()}`}</h1>
          <p className="text-xs text-gray-300 mt-1">
            Host: <strong className="text-white">{show?.host_name || 'Host'}</strong> • {show?.broadcaster || 'Broadcast Network'}
          </p>

          {/* Quick Stats Pill */}
          <div className="mt-4 flex items-center space-x-3 text-xs pt-3 border-t border-[#1E293B]">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">Season On Air</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">{seasons.length} Seasons Listed</span>
          </div>
        </div>

        {/* Featured Ongoing Season CTA */}
        {ongoingSeason && (
          <div className="bg-[#131B2E] border border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-amber-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded-full">
                LIVE SEASON
              </span>
              <span className="text-xs text-gray-400 font-mono">Year {ongoingSeason.year}</span>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white">{ongoingSeason.title}</h2>
              {ongoingSeason.tagline && (
                <p className="text-xs text-amber-400/90 italic mt-0.5">"{ongoingSeason.tagline}"</p>
              )}
            </div>

            <Link
              href={`/${language}/season${ongoingSeason.season_number}`}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-black font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>ENTER SEASON {ongoingSeason.season_number} VOTING</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* All Seasons List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Seasons</h3>
          {seasons.length === 0 ? (
            <div className="bg-[#131B2E] border border-[#1E293B] rounded-xl p-4 text-center text-xs text-gray-500">
              No seasons found for this language. Add one in the Admin dashboard!
            </div>
          ) : (
            seasons.map((s) => (
              <Link
                key={s.id}
                href={`/${language}/season${s.season_number}`}
                className="block bg-[#131B2E] hover:bg-[#18233C] border border-[#1E293B] rounded-xl p-3.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{s.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      Season {s.season_number} • {s.status === 'ongoing' ? 'Active Poll' : 'Completed'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <DeviceAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deviceAccount={deviceAccount}
        onUpdate={(updated) => setDeviceAccount(updated)}
      />
    </div>
  );
}
