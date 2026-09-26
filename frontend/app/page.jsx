'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CountdownTimer from '../components/CountdownTimer';
import VotingBallot from '../components/VotingBallot';
import LiveDiscussion from '../components/LiveDiscussion';
import ArchiveSection from '../components/ArchiveSection';
import DeviceAccountModal from '../components/DeviceAccountModal';
import { getDeviceAccount } from '../lib/device';
import { ShieldCheck, Info, Flame, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [archiveWeeks, setArchiveWeeks] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [votedForId, setVotedForId] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize device account on mount
  useEffect(() => {
    const acc = getDeviceAccount();
    setDeviceAccount(acc);
  }, []);

  // Fetch all shows
  useEffect(() => {
    fetch(`${API_BASE}/shows`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShows(data);
          setSelectedShow(data[0]); // Default to Bigg Boss Hindi
        }
      })
      .catch((err) => console.error('Failed to fetch shows:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // When selectedShow or deviceAccount changes, load the active poll and check vote status
  useEffect(() => {
    if (!selectedShow) return;

    fetch(`${API_BASE}/polls/active`)
      .then((res) => res.json())
      .then((polls) => {
        if (Array.isArray(polls)) {
          // Find poll matching current show slug or default to first
          const poll = polls.find((p) => p.show?.slug === selectedShow.slug) || polls[0];
          setActivePoll(poll);

          if (poll && deviceAccount?.deviceId) {
            // Check if device already voted today
            fetch(`${API_BASE}/polls/${poll.id}?device_id=${deviceAccount.deviceId}`)
              .then((r) => r.json())
              .then((pollData) => {
                setHasVotedToday(pollData.has_voted_today || false);
                setVotedForId(pollData.voted_for_id || null);
              });
          }
        }
      })
      .catch((err) => console.error('Failed to fetch active poll:', err));

    // Fetch archives for this show
    fetch(`${API_BASE}/polls/${selectedShow.slug}/archive`)
      .then((res) => res.json())
      .then((archives) => {
        if (Array.isArray(archives)) {
          setArchiveWeeks(archives);
        }
      })
      .catch((err) => console.error('Failed to fetch archive:', err));
  }, [selectedShow, deviceAccount?.deviceId]);

  // Handle voting
  const handleVote = async (contestantId) => {
    if (!activePoll || !deviceAccount?.deviceId || isVoting) return;

    setIsVoting(true);
    setVoteMessage('');

    try {
      const res = await fetch(`${API_BASE}/polls/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_id: activePoll.id,
          contestant_id: contestantId,
          device_id: deviceAccount.deviceId,
          nickname: deviceAccount.nickname,
        }),
      });

      const data = await res.json();
      if (data.success || data.has_voted_today) {
        setHasVotedToday(true);
        setVotedForId(data.voted_for_id || contestantId);
        setVoteMessage(data.message);

        // Update active poll standings in place
        if (data.standings) {
          setActivePoll((prev) => ({
            ...prev,
            total_votes: data.total_votes,
            nominees: data.standings,
          }));
        }
      } else {
        alert(data.message || 'Vote could not be processed.');
      }
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      {/* Sticky Mobile Header */}
      <Header
        shows={shows}
        selectedShow={selectedShow}
        onSelectShow={(show) => setSelectedShow(show)}
        deviceAccount={deviceAccount}
        onOpenAccountModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Area (Optimized for Mobile Viewports) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* TV Broadcaster & Host Tag */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 bg-[#131B2E] border border-[#1E293B] px-3 py-1.5 rounded-xl">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-semibold text-gray-200">{selectedShow?.name || 'Bigg Boss'}</span>
          </span>
          <span>Host: <strong className="text-white">{selectedShow?.host_name || 'Salman Khan'}</strong></span>
        </div>

        {/* Real-time Countdown Timer (Synced to Friday midnight) */}
        <CountdownTimer endsAt={activePoll?.ends_at} />

        {/* 1-Tap Voting Ballot */}
        {activePoll ? (
          <VotingBallot
            poll={activePoll}
            hasVotedToday={hasVotedToday}
            votedForId={votedForId}
            onVote={handleVote}
            isVoting={isVoting}
            voteMessage={voteMessage}
          />
        ) : (
          <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-6 text-center text-xs text-gray-400">
            {isLoading ? 'Loading active nomination ballot...' : 'No active nomination poll found for this language.'}
          </div>
        )}

        {/* Inline Live Chat / Discussion Feed */}
        {activePoll && (
          <LiveDiscussion
            weekId={activePoll.id}
            deviceAccount={deviceAccount}
            apiUrl={API_BASE}
            wsUrl={WS_BASE}
          />
        )}

        {/* Previous Weeks Archive (Past weeks & eviction records) */}
        <ArchiveSection archiveWeeks={archiveWeeks} />

        {/* Legal Fan Page Disclaimer */}
        <footer className="text-center pt-4 pb-8 space-y-2 text-[10px] text-gray-400 border-t border-[#1E293B]/70">
          <div className="flex items-center justify-center space-x-1.5 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-gray-300">Independent Community Fan Poll</span>
          </div>
          <p className="leading-relaxed px-4">
            HousePulse is an independent fan platform and is not affiliated with, endorsed by, or sponsored by Viacom18, JioCinema, Disney+ Hotstar, Star Maa, Asianet, Colors TV, Endemol Shine, or Banijay. Fan votes do not decide the official TV broadcast result.
          </p>
          <p className="text-gray-400 font-mono text-[9px]">
            © 2026 HousePulse • 1 Vote per Day per Device
          </p>
        </footer>
      </main>

      {/* Device Account Modal */}
      <DeviceAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deviceAccount={deviceAccount}
        onUpdate={(updated) => setDeviceAccount(updated)}
      />
    </div>
  );
}
