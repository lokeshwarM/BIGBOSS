'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import DeviceAccountModal from '../components/DeviceAccountModal';
import {
  AuroraGlow,
  BlurText,
  NetflixPosterCard,
  PulseGlowBadge,
  SpotlightCard,
} from '../components/effects';
import { fetchShows } from '../lib/api';
import { getDeviceAccount } from '../lib/device';
import { useTheme } from '../context/ThemeContext';
import { Play, Info, Flame, ShieldCheck, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLight } = useTheme();

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
    fetchShows()
      .then((data) => setShows(data || []))
      .catch((err) => console.error('Failed to load shows:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300">
      {/* Dynamic Atmospheric Glow (Netflix Red in Dark, Prime Cyan/Blue in Light) */}
      <AuroraGlow />

      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 pb-16 z-10">
        {/* =================================================================== */}
        {/* CINEMATIC HERO BILLBOARD                                            */}
        {/* =================================================================== */}
        <div className="relative w-full max-w-4xl mx-auto px-4 pt-3 pb-8">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] border border-[#2A2A2A] shadow-2xl bg-black">
            {/* Backdrop Visual */}
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
              alt="Bigg Boss Spotlight"
              className="w-full h-full object-cover object-center brightness-75 scale-105"
            />

            {/* Gradient Overlays (Netflix / Prime Video Style) */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                isLight
                  ? 'from-[#0B1528]/95 via-[#0B1528]/60 to-transparent'
                  : 'from-[#141414] via-[#141414]/70 to-transparent'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

            {/* Billboard Content */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 max-w-xl space-y-2 sm:space-y-3">
              {/* Badge Tag */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow tracking-wider ${
                    isLight
                      ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1]'
                      : 'bg-[#E50914]'
                  }`}
                >
                  {isLight ? 'PRIME FEATURED' : 'TOP 10 IN INDIA'}
                </span>
                <span className="text-[10px] font-bold text-gray-200 flex items-center space-x-1">
                  <TrendingUp className={`w-3 h-3 ${isLight ? 'text-sky-400' : 'text-red-500'}`} />
                  <span>#1 Reality Voting Platform</span>
                </span>
              </div>

              {/* Title with BlurText animation */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                <BlurText text="Bigg Boss Fan Pulse" delay={40} />
              </h1>

              <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow">
                Vote daily for your favourite contestant across Telugu, Tamil, Hindi, Kannada, Malayalam, Marathi & Bangla. Free, instant, zero sign-in barrier.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <Link
                  href="/telugu/season10"
                  className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-xl hover:scale-105 active:scale-95 transition-all ${
                    isLight
                      ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-sky-500/25'
                      : 'bg-white hover:bg-gray-200 text-black'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Vote Now</span>
                </Link>

                <Link
                  href="/telugu"
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2 backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>Season Hub</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* HORIZONTAL SHELVES / ROWS                                           */}
        {/* =================================================================== */}
        <div className="max-w-4xl mx-auto px-4 space-y-7">
          {/* Row 1: On-Air Seasons */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2
                  className={`text-sm sm:text-base font-extrabold tracking-wide ${
                    isLight ? 'text-[#0F172A]' : 'text-white'
                  }`}
                >
                  🔥 Trending On-Air Shows
                </h2>
                <span className="text-[10px] text-gray-500 font-bold">Updated Daily</span>
              </div>
              <span
                className={`text-[11px] font-bold cursor-pointer hover:underline ${
                  isLight ? 'text-[#0073B1]' : 'text-[#E50914]'
                }`}
              >
                Explore all →
              </span>
            </div>

            {/* Horizontal Scroll Poster Rail */}
            <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth">
              <NetflixPosterCard
                href="/telugu/season10"
                title="Bigg Boss Telugu"
                subtitle="Host: Nagarjuna • Season 10"
                imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80"
                rank={1}
                matchScore={99}
                badgeText="LIVE VOTE"
              />
              <NetflixPosterCard
                href="/tamil/season10"
                title="Bigg Boss Tamil"
                subtitle="Host: Vijay Sethupathi • Season 10"
                imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                rank={2}
                matchScore={97}
                badgeText="WEEK 3"
              />
              <NetflixPosterCard
                href="/hindi/season20"
                title="Bigg Boss Hindi"
                subtitle="Host: Salman Khan • Season 20"
                imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
                rank={3}
                matchScore={96}
                badgeText="ON AIR"
              />
              <NetflixPosterCard
                href="/kannada/season13"
                title="Bigg Boss Kannada"
                subtitle="Host: Kichcha Sudeep • Season 13"
                imageUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
                rank={4}
                matchScore={94}
                badgeText="ON AIR"
              />
              <NetflixPosterCard
                href="/malayalam/season8"
                title="Bigg Boss Malayalam"
                subtitle="Host: Mohanlal • Season 8"
                imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
                rank={5}
                matchScore={92}
                badgeText="ON AIR"
              />
              <NetflixPosterCard
                href="/marathi/season6"
                title="Bigg Boss Marathi"
                subtitle="Host: Riteish Deshmukh • Season 6"
                imageUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80"
                rank={6}
                matchScore={90}
                badgeText="COMPLETED"
              />
            </div>
          </section>

          {/* Row 2: Spotlight Feature Cards */}
          <section className="space-y-3">
            <h2
              className={`text-sm sm:text-base font-extrabold tracking-wide ${
                isLight ? 'text-[#0F172A]' : 'text-white'
              }`}
            >
              ⚡ How HousePulse Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SpotlightCard className="p-4 space-y-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLight
                      ? 'bg-sky-100 text-[#0073B1] border border-sky-200'
                      : 'bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs">1 Vote Per Day / Device</h3>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  No sign-in walls. Vote once daily for your favourite contestant from this device.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-4 space-y-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLight
                      ? 'bg-sky-100 text-[#00A8E1] border border-sky-200'
                      : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs">Live Real-time Standings</h3>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  Percentage bars unlock the second your vote lands, with instant WebSockets stream.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-4 space-y-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isLight
                      ? 'bg-sky-100 text-blue-600 border border-sky-200'
                      : 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs">Full Season Archives</h3>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  Track every completed week, final fan standings, and official TV eviction outcomes.
                </p>
              </SpotlightCard>
            </div>
          </section>

          {/* Row 3: Admin Quick Access */}
          <section className="pt-2">
            <Link
              href="/admin"
              className={`block p-4 rounded-2xl border transition-all group ${
                isLight
                  ? 'bg-white/80 hover:bg-white border-[#D0E4F7] hover:border-[#00A8E1] shadow-lg shadow-sky-900/5'
                  : 'bg-gradient-to-r from-[#181818] via-[#202020] to-[#181818] border-[#2A2A2A] hover:border-[#E50914]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-bold transition-colors block ${
                      isLight
                        ? 'text-[#0F172A] group-hover:text-[#00A8E1]'
                        : 'text-white group-hover:text-[#E50914]'
                    }`}
                  >
                    Manage Contestants & Weekly Polls
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    Launch new Monday-to-Friday nomination polls or declare evicted housemates.
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-white text-[11px] font-black group-hover:scale-105 transition-transform flex items-center space-x-1 ${
                    isLight
                      ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] shadow-md shadow-sky-500/20'
                      : 'bg-[#E50914]'
                  }`}
                >
                  <span>Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </section>
        </div>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-4 mt-12 pt-6 border-t border-[#D0E4F7]/40 dark:border-[#222222] text-center text-gray-500 space-y-2 text-[10px]">
          <p>Questions? Unofficial Reality TV Fan Intelligence Platform</p>
          <p className="max-w-md mx-auto leading-relaxed">
            HousePulse is not affiliated with or endorsed by Viacom18, Banijay, Star Maa, Asianet, or JioCinema. All trademarks and celebrity images belong to their respective copyright holders.
          </p>
          <p className="font-mono text-gray-400">
            {isLight ? 'Amazon Prime Video Gradient Light Edition' : 'Netflix Cinema Edition'}
          </p>
        </footer>
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
