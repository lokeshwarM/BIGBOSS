'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import DeviceAccountModal from '../components/DeviceAccountModal';
import { fetchShows } from '../lib/api';
import { getDeviceAccount } from '../lib/device';
import { Flame, ArrowRight, ShieldCheck, Sparkles, Settings, Users, Tv } from 'lucide-react';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
    fetchShows()
      .then((data) => setShows(data || []))
      .catch((err) => console.error('Failed to load shows:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-amber-500/15 via-[#18233C] to-[#131B2E] border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Language Reality TV Fan Intelligence</span>
          </div>

          <h1 className="text-xl font-black text-white leading-tight">
            Bigg Boss Fan Voting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">
              Free • Daily • All Languages
            </span>
          </h1>

          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            Vote once every day per device with zero sign-in wall. Track weekly nominations, view live standings, and participate in real-time episode discussions.
          </p>

          <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live TV Sync Active</span>
            </span>
            <Link
              href="/telugu"
              className="text-amber-400 font-black hover:underline flex items-center space-x-1"
            >
              <span>Explore Telugu →</span>
            </Link>
          </div>
        </div>

        {/* Regional Shows Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">
              Select Your Bigg Boss Show
            </h2>
            <span className="text-[10px] text-gray-500">{shows.length} Languages</span>
          </div>

          <div className="space-y-2">
            {shows.map((show) => (
              <Link
                key={show.slug}
                href={`/${show.slug}`}
                className="group block bg-[#131B2E] hover:bg-[#18233C] border border-[#1E293B] hover:border-amber-500/40 rounded-2xl p-3.5 transition-all duration-200 active:scale-[0.99] shadow-md shadow-black/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md"
                      style={{ backgroundColor: show.accent_color || '#F59E0B' }}
                    >
                      {show.language?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {show.name}
                        </span>
                        <span className="text-[9px] bg-[#0B0F19] text-gray-400 px-1.5 py-0.5 rounded font-mono border border-[#1E293B]">
                          {show.language}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Host: <strong className="text-gray-200">{show.host_name}</strong> • {show.broadcaster}
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#0B0F19] border border-[#1E293B] flex items-center justify-center text-gray-400 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Quick Access Card */}
        <div className="bg-[#131B2E]/60 border border-dashed border-[#1E293B] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-white">Admin Management Portal</span>
              <span className="block text-[10px] text-gray-400">Add Contestants & Control Weekly Polls</span>
            </div>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] rounded-xl transition-all"
          >
            Manage
          </Link>
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center pt-4 pb-8 space-y-2 text-[10px] text-gray-400 border-t border-[#1E293B]/70">
          <div className="flex items-center justify-center space-x-1.5 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-gray-300">Independent Community Fan Poll</span>
          </div>
          <p className="leading-relaxed px-4">
            HousePulse is an independent fan platform. Unofficial fan sentiment poll. Votes cast here do not influence the official TV broadcaster eviction.
          </p>
          <p className="text-gray-400 font-mono text-[9px]">
            © 2026 HousePulse • 1 Vote per Day per Device
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
