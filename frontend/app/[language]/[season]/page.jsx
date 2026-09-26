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
import { fetchSeasonDetail, castVote, fetchPollById } from '../../../lib/api';
import { getDeviceAccount } from '../../../lib/device';
import { ShieldCheck, Tv, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';

export default function SeasonHubPage() {
  const params = useParams();
  const language = params?.language || 'telugu';
  const seasonParam = params?.season || 'season10';

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

  // Load device account
  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
  }, []);

  // Fetch season data
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

  // Handle 1-tap voting
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
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Season Header Info */}
        <div className="bg-[#131B2E] border border-[#1E293B] px-3.5 py-2 rounded-xl flex items-center justify-between text-[11px] text-gray-300">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-extrabold text-white">{seasonData?.title || 'Bigg Boss Season'}</span>
          </span>
          <span className="font-mono text-gray-400">
            {seasonData?.status === 'ongoing' ? '🟢 ON AIR' : 'COMPLETED'}
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
          <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-6 text-center text-xs text-gray-400">
            {isLoading ? (
              'Loading season ballot...'
            ) : (
              <div>
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                <p>No active voting poll for this week yet.</p>
                <p className="text-[10px] text-gray-500 mt-1">Admin can launch this week's nomination poll anytime from the admin portal.</p>
              </div>
            )}
          </div>
        )}

        {/* Inline Live Discussion / Chat Room */}
        {activePoll && (
          <LiveDiscussion
            weekId={activePoll.id}
            deviceAccount={deviceAccount}
            apiUrl={API_BASE}
            wsUrl={WS_BASE}
          />
        )}

        {/* Season Contestants Roster */}
        <ContestantRoster contestants={contestants} />

        {/* Previous Completed Weeks Archive */}
        <ArchiveSection archiveWeeks={archiveWeeks} />

        {/* Footer Disclaimer */}
        <footer className="text-center pt-4 pb-8 space-y-2 text-[10px] text-gray-400 border-t border-[#1E293B]/70">
          <div className="flex items-center justify-center space-x-1.5 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-gray-300">Independent Fan Poll</span>
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
