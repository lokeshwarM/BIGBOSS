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
  ShinyText,
  SpotlightCard,
} from '../components/effects';
import { fetchShows } from '../lib/api';
import { getDeviceAccount } from '../lib/device';
import { Play, Info, Flame, ShieldCheck, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
    fetchShows()
      .then((data) => setShows(data || []))
      .catch((err) => console.error('Failed to load shows:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#141414] text-white relative selection:bg-[#E50914] selection:text-white">
      {/* Netflix Cinematic Atmospheric Glow */}
      <AuroraGlow primaryColor="#E50914" secondaryColor="#B81D24" opacity={0.14} />

      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 pb-16 z-10">
        {/* =================================================================== */}
        {/* NETFLIX HERO BILLBOARD                                              */}
        {/* =================================================================== */}
        <div className="relative w-full max-w-4xl mx-auto px-4 pt-3 pb-8">
          <div className="relative rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] border border-[#2A2A2A] shadow-2xl bg-black">
            {/* Backdrop Visual */}
            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
              alt="Bigg Boss Spotlight"
              className="w-full h-full object-cover object-center brightness-75 scale-105"
            />

            {/* Gradient Overlays (Netflix Signature Fade) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent" />

            {/* Billboard Content */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 max-w-xl space-y-2 sm:space-y-3">
              {/* Netflix Top 10 Ribbon */}
              <div className="flex items-center space-x-2">
                <span className="bg-[#E50914] text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded shadow tracking-wider">
                  TOP 10 IN INDIA
                </span>
                <span className="text-[10px] font-bold text-gray-300 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span>#1 Reality Voting Platform</span>
                </span>
              </div>

              {/* Title with BlurText animation */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                <BlurText text="Bigg Boss Fan Pulse" delay={40} />
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed drop-shadow">
                Vote daily for your favourite contestant across Telugu, Tamil, Hindi, Kannada, Malayalam, Marathi & Bangla. Free, instant, zero sign-in barrier.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <Link
                  href="/telugu/season10"
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-white hover:bg-gray-200 text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Vote Now</span>
                </Link>

                <Link
                  href="/telugu"
                  className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2 backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Info className="w-4 h-4" />
                  <span>Season Hub</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* NETFLIX HORIZONTAL SHELVES / ROWS                                   */}
        {/* =================================================================== */}
        <div className="max-w-4xl mx-auto px-4 space-y-7">
          {/* Row 1: On-Air Seasons */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  🔥 Trending On-Air Shows
                </h2>
                <span className="text-[10px] text-gray-500 font-bold">Updated Daily</span>
              </div>
              <span className="text-[11px] text-[#E50914] font-bold cursor-pointer hover:underline">
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
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              ⚡ How HousePulse Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SpotlightCard className="p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-white">1 Vote Per Day / Device</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  No sign-in walls. Vote once daily for your favourite contestant from this device.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-white">Live Real-time Standings</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Percentage bars unlock the second your vote lands, with instant WebSockets stream.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-white">Full Season Archives</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Track every completed week, final fan standings, and official TV eviction outcomes.
                </p>
              </SpotlightCard>
            </div>
          </section>

          {/* Row 3: Admin Quick Access */}
          <section className="pt-2">
            <Link
              href="/admin"
              className="block bg-gradient-to-r from-[#181818] via-[#202020] to-[#181818] border border-[#2A2A2A] hover:border-[#E50914] p-4 rounded-2xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors block">
                    Manage Contestants & Weekly Polls
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Launch new Monday-to-Friday nomination polls or declare evicted housemates.
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#E50914] text-white text-[11px] font-black group-hover:scale-105 transition-transform flex items-center space-x-1">
                  <span>Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </section>
        </div>

        {/* Netflix Style Minimalist Footer */}
        <footer className="max-w-4xl mx-auto px-4 mt-12 pt-6 border-t border-[#222222] text-center text-gray-500 space-y-2 text-[10px]">
          <p>Questions? Unofficial Reality TV Fan Intelligence Platform</p>
          <p className="max-w-md mx-auto leading-relaxed">
            HousePulse is not affiliated with or endorsed by Viacom18, Banijay, Star Maa, Asianet, or JioCinema. All trademarks and celebrity images belong to their respective copyright holders.
          </p>
          <p className="font-mono text-gray-600">© 2026 HousePulse • Netflix-Inspired Mobile UI</p>
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
