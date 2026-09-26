'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import DeviceAccountModal from '../../components/DeviceAccountModal';
import { AuroraGlow, BlurText, PulseGlowBadge } from '../../components/effects';
import { fetchShowBySlug, fetchSeasonsByShow } from '../../lib/api';
import { getDeviceAccount } from '../../lib/device';
import { Play, ArrowRight, Tv, Users, Calendar, Award } from 'lucide-react';

export default function LanguageShowPage() {
  const params = useParams();
  const language = params?.language || 'telugu';

  const [show, setShow] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());

    Promise.all([
      fetchShowBySlug(language).catch(() => null),
      fetchSeasonsByShow(language).catch(() => []),
    ]).then(([showData, seasonsData]) => {
      setShow(showData);
      setSeasons(seasonsData || []);
    });
  }, [language]);

  const ongoingSeason = seasons.find((s) => s.status === 'ongoing') || seasons[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white relative selection:bg-[#E50914] selection:text-white">
      <AuroraGlow primaryColor="#E50914" opacity={0.12} />
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 space-y-6 z-10">
        {/* Netflix Show Billboard */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] border border-[#2A2A2A] bg-black shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
            alt={show?.name || language}
            className="w-full h-full object-cover object-center brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 max-w-xl space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2">
              <span className="bg-[#E50914] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                REGIONAL ORIGINAL
              </span>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider font-mono">
                {show?.language || language}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
              <BlurText text={show?.name || `Bigg Boss ${language.toUpperCase()}`} delay={30} />
            </h1>

            <p className="text-xs sm:text-sm text-gray-300">
              Host: <strong className="text-white">{show?.host_name || 'Host'}</strong> • Network: {show?.broadcaster || 'Star / Colors'}
            </p>

            {ongoingSeason && (
              <div className="pt-2">
                <Link
                  href={`/${language}/season${ongoingSeason.season_number}`}
                  className="px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#b81d24] text-white font-black text-xs sm:text-sm inline-flex items-center space-x-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Enter Season {ongoingSeason.season_number} Voting</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Netflix Style Season Selector Rail */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white tracking-wide">
              Seasons Shelf
            </h2>
            <span className="text-xs text-gray-500">{seasons.length} Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {seasons.map((s) => (
              <Link
                key={s.id}
                href={`/${language}/season${s.season_number}`}
                className="group p-4 rounded-2xl bg-[#181818] border border-[#2A2A2A] hover:border-[#E50914] transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#E50914]/10 block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-gray-300 group-hover:text-white">
                    Season {s.season_number}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {s.status === 'ongoing' ? '● LIVE ON AIR' : 'ARCHIVED'}
                  </span>
                </div>

                <h3 className="text-sm font-black text-white group-hover:text-[#E50914] transition-colors">
                  {s.title}
                </h3>
                {s.tagline && <p className="text-[11px] text-gray-400 italic mt-0.5">"{s.tagline}"</p>}

                <div className="mt-3 pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] text-gray-400">
                  <span>Year {s.year}</span>
                  <span className="text-[#E50914] font-bold group-hover:underline flex items-center space-x-1">
                    <span>Vote & Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
