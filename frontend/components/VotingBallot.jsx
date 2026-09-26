'use client';

import React, { useState } from 'react';
import { CheckCircle2, Share2, Sparkles, Heart } from 'lucide-react';
import { SpotlightCard, CountUp } from './effects';
import { useTheme } from '../context/ThemeContext';

export default function VotingBallot({
  poll,
  hasVotedToday,
  votedForId,
  onVote,
  isVoting,
  voteMessage,
}) {
  const { isLight } = useTheme();
  const [selectedContestantId, setSelectedContestantId] = useState(null);

  const nominees = poll?.nominees || [];
  const totalVotes = poll?.total_votes || 0;

  const handleShare = (contestantName) => {
    const text = encodeURIComponent(
      `🔥 I just voted for ${contestantName} on BIGBOSS Community! Support your favourite housemate before eviction: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Title & Info Banner */}
      <SpotlightCard className="p-4">
        <div
          className={`flex items-center space-x-2 text-xs font-black uppercase tracking-wider mb-1 ${
            isLight ? 'text-[#0073B1]' : 'text-[#E50914]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nomination Week {poll?.week_number} Ballot</span>
        </div>
        <h2 className={`text-base font-black leading-snug ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
          {poll?.title}
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          {poll?.description}
        </p>

        {/* Live Daily Status Pill */}
        <div className={`mt-3 flex items-center justify-between text-[11px] pt-2 border-t ${isLight ? 'border-sky-100' : 'border-[#2A2A2A]'}`}>
          <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>Total Fan Votes:</span>
          <span className={`font-extrabold font-mono text-xs ${isLight ? 'text-[#00A8E1]' : 'text-[#E50914]'}`}>
            <CountUp to={totalVotes} duration={0.8} /> votes
          </span>
        </div>
      </SpotlightCard>

      {/* Daily Vote Status Banner */}
      {hasVotedToday && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start space-x-3 text-emerald-500">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Daily Vote Counted!</p>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
              Live standings unlocked below. Return tomorrow to cast your next daily vote.
            </p>
          </div>
        </div>
      )}

      {/* Nominees List */}
      <div className="space-y-3">
        {nominees.map((nominee, index) => {
          const isVotedForThis = votedForId === nominee.id;
          const voteShare = nominee.vote_share || 0;

          return (
            <div
              key={nominee.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isVotedForThis
                  ? isLight
                    ? 'bg-[#EAF5FF] border-[#00A8E1] shadow-lg shadow-sky-500/15'
                    : 'bg-[#1E1E1E] border-[#E50914] shadow-lg shadow-[#E50914]/20'
                  : isLight
                  ? 'bg-white border-[#D0E4F7] hover:border-sky-400 shadow-sm'
                  : 'bg-[#181818] border-[#2A2A2A] hover:border-gray-500'
              }`}
            >
              <div className="p-3.5 flex items-center space-x-3.5">
                {/* Contestant Photo */}
                <div className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border bg-black/40 ${isLight ? 'border-sky-100' : 'border-[#2A2A2A]'}`}>
                  <img
                    src={nominee.photo_url}
                    alt={nominee.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  {isVotedForThis && (
                    <div className={`absolute inset-0 flex items-center justify-center ${isLight ? 'bg-[#00A8E1]/30' : 'bg-[#E50914]/30'}`}>
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-extrabold text-sm truncate ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {nominee.name}
                    </span>
                    {nominee.native_name && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isLight ? 'bg-sky-50 text-sky-800 border-sky-100' : 'bg-black/60 text-gray-400 border-[#2A2A2A]'}`}>
                        {nominee.native_name}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {nominee.occupation}
                  </p>

                  {/* Percentage Progress Bar (Visible once voted) */}
                  {hasVotedToday ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className={`font-bold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                          {nominee.vote_count?.toLocaleString()} votes
                        </span>
                        <span className={`font-black font-mono text-xs ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`}>
                          {voteShare.toFixed(1)}%
                        </span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isLight ? 'bg-sky-100 border-sky-200' : 'bg-black border-[#2A2A2A]'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isLight
                              ? index === 0
                                ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1]'
                                : 'bg-gradient-to-r from-sky-400 to-indigo-500'
                              : index === 0
                              ? 'bg-gradient-to-r from-[#E50914] to-red-400'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-300'
                          }`}
                          style={{ width: `${Math.max(voteShare, 2)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onVote(nominee.id)}
                      disabled={isVoting}
                      className={`mt-2.5 w-full py-2 px-3 rounded-xl active:scale-[0.98] font-black text-xs flex items-center justify-center space-x-1.5 transition-all text-white ${
                        isLight
                          ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0092c4] hover:to-[#005f93] shadow-md shadow-sky-500/20'
                          : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>{isVoting ? 'Saving...' : 'Vote ' + nominee.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Share CTA if voted for this candidate */}
              {hasVotedToday && isVotedForThis && (
                <div className={`px-3.5 py-2 border-t flex items-center justify-between ${isLight ? 'bg-sky-50/80 border-sky-100' : 'bg-black/60 border-[#2A2A2A]'}`}>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your vote today</span>
                  </span>
                  <button
                    onClick={() => handleShare(nominee.name)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-green-600 bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1 rounded-lg border border-green-500/30 transition-all active:scale-95"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
