'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import CountdownTimer from '../../../components/CountdownTimer';
import VotingBallot from '../../../components/VotingBallot';
import LiveDiscussion from '../../../components/LiveDiscussion';
import ContestantRoster from '../../../components/ContestantRoster';
import ArchiveSection from '../../../components/ArchiveSection';
import DeviceAccountModal from '../../../components/DeviceAccountModal';
import { AuroraGlow, BlurText, PulseGlowBadge } from '../../../components/effects';
import { fetchSeasonDetail, castVote, fetchPollById } from '../../../lib/api';
import { getDeviceAccount } from '../../../lib/device';
import { useTheme } from '../../../context/ThemeContext';
import { ShieldCheck, AlertCircle, Play } from 'lucide-react';

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8081/api`;
  }
  return 'http://localhost:8081/api';
};

const getWsBase = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.hostname}:8081/ws`;
  }
  return 'ws://localhost:8081/ws';
};

export default function SeasonHubPage() {
  const params = useParams();
  const language = params?.language || 'telugu';
  const seasonParam = params?.season || 'season10';
  const { isLight } = useTheme();

  const [seasonData, setSeasonData] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [contestants, setContestants] = useState([]);
  const [archiveWeeks, setArchiveWeeks] = useState([]);
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [votedForId, setVotedForId] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
  }, []);

  const loadSeason = async () => {
    try {
      const data = await fetchSeasonDetail(language, seasonParam);
      setSeasonData(data.season);
      setActivePoll(data.active_poll);
      setContestants(data.contestants || []);
      setArchiveWeeks(data.archive || []);

      if (data.active_poll && deviceAccount?.deviceId) {
        const pollCheck = await fetchPollById(data.active_poll.id, deviceAccount.deviceId);
        setHasVotedToday(pollCheck.has_voted_today || false);
        setVotedForId(pollCheck.voted_for_id || null);
      }
    } catch (err) {
      console.error('Failed to load season details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deviceAccount?.deviceId) {
      loadSeason();
    }
  }, [language, seasonParam, deviceAccount?.deviceId]);

  const handleVote = async (contestantId) => {
    if (!activePoll || !deviceAccount?.deviceId || isVoting) return;

    setIsVoting(true);
    setVoteMessage('');

    try {
      const res = await castVote({
        weekId: activePoll.id,
        contestantId,
        deviceId: deviceAccount.deviceId,
        nickname: deviceAccount.nickname,
      });

      if (res.success || res.has_voted_today) {
        setHasVotedToday(true);
        setVotedForId(res.voted_for_id || contestantId);
        setVoteMessage(res.message);

        if (res.standings) {
          setActivePoll((prev) => ({
            ...prev,
            total_votes: res.total_votes,
            nominees: res.standings,
          }));
        }
      } else {
        alert(res.message || 'Vote could not be processed.');
      }
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
        isLight
          ? 'text-[#0F172A] selection:bg-[#00A8E1] selection:text-white'
          : 'bg-[#141414] text-white selection:bg-[#E50914] selection:text-white'
      }`}
    >
      <AuroraGlow />
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 z-10">
        {/* Season Pill Header */}
        <div
          className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs border transition-colors ${
            isLight
              ? 'bg-white/95 border-[#D0E4F7] shadow-md shadow-sky-900/5'
              : 'bg-[#181818] border-[#2A2A2A]'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isLight ? 'bg-[#00A8E1]' : 'bg-[#E50914]'
              }`}
            />
            <span className={`font-black ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
              {seasonData?.title || 'Bigg Boss Season'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isLight
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-black/60 border-[#2A2A2A] text-emerald-400'
            }`}
          >
            {seasonData?.status === 'ongoing' ? 'ON AIR' : 'ARCHIVED'}
          </span>
        </div>

        {/* Friday Night Countdown Timer */}
        <CountdownTimer endsAt={activePoll?.ends_at} />

        {/* 1-Tap Anonymous Voting Ballot */}
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
          <div
            className={`rounded-2xl p-6 text-center text-xs border ${
              isLight
                ? 'bg-white/95 border-[#D0E4F7] text-gray-600 shadow-md'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-400'
            }`}
          >
            {isLoading ? (
              'Loading season ballot...'
            ) : (
              <div>
                <AlertCircle
                  className={`w-6 h-6 mx-auto mb-2 ${
                    isLight ? 'text-[#00A8E1]' : 'text-[#E50914]'
                  }`}
                />
                <p className={`font-bold ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                  No active nomination poll this week yet.
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Launch the next week poll anytime from the Admin portal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Inline Live Discussion / Community Opinions */}
        {activePoll && (
          <LiveDiscussion
            weekId={activePoll.id}
            seasonId={seasonData?.id}
            deviceAccount={deviceAccount}
            apiUrl={getApiBase()}
            wsUrl={getWsBase()}
            onOpenAuthModal={() => setIsModalOpen(true)}
          />
        )}

        {/* Season Contestants Roster */}

        <ContestantRoster contestants={contestants} />

        {/* Previous Completed Weeks Archive */}
        <ArchiveSection archiveWeeks={archiveWeeks} />

        {/* Footer Disclaimer */}
        <footer className="text-center pt-4 pb-8 space-y-2 text-[10px] text-gray-500 border-t border-[#D0E4F7]/40 dark:border-[#222222]">
          <div className="flex items-center justify-center space-x-1.5 text-gray-400">
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
            <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Independent Fan Community Poll</span>
          </div>
          <p className="leading-relaxed px-4">
            BIGBOSS Community is an independent fan platform. Unofficial audience sentiment poll. Votes cast here do not decide the official broadcaster eviction.
          </p>
          <p className="font-mono text-gray-400 text-[9px]">
            © 2026 BIGBOSS Community • 1 Vote per Day per Device
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
