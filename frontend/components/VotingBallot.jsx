'use client';

import React, { useState } from 'react';
import { CheckCircle2, Share2, Sparkles, AlertCircle, Heart } from 'lucide-react';

export default function VotingBallot({
  poll,
  hasVotedToday,
  votedForId,
  onVote,
  isVoting,
  voteMessage,
}) {
  const [selectedContestantId, setSelectedContestantId] = useState(null);

  const nominees = poll?.nominees || [];
  const totalVotes = poll?.total_votes || 0;

  const handleShare = (contestantName) => {
    const text = encodeURIComponent(
      `🔥 I just cast my fan vote for ${contestantName} on HousePulse! Support your favourite Bigg Boss contestant here: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Title & Info Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nomination Week {poll?.week_number} Ballot</span>
        </div>
        <h2 className="text-base font-extrabold text-white leading-snug">{poll?.title}</h2>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{poll?.description}</p>

        {/* Live Daily Status Pill */}
        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
          <span className="text-gray-400">Total Fan Votes Cast:</span>
          <span className="font-bold text-amber-400 font-mono text-xs">
            {totalVotes.toLocaleString()} votes
          </span>
        </div>
      </div>

      {/* Daily Vote Status Banner */}
      {hasVotedToday && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start space-x-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">Daily Vote Counted!</p>
            <p className="text-gray-300 text-[11px] mt-0.5">
              Live standings unlocked below. You can return tomorrow to cast another daily vote.
            </p>
          </div>
        </div>
      )}

      {/* Nominees List */}
      <div className="space-y-3">
        {nominees.map((nominee, index) => {
          const isVotedForThis = votedForId === nominee.id;
          const isSelected = selectedContestantId === nominee.id;
          const voteShare = nominee.vote_share || 0;

          return (
            <div
              key={nominee.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                isVotedForThis
                  ? 'bg-[#18233C] border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : isSelected
                  ? 'bg-[#18233C] border-amber-500 shadow-lg shadow-amber-500/15'
                  : 'bg-[#131B2E] border-[#1E293B] hover:border-gray-700'
              }`}
            >
              <div className="p-3.5 flex items-center space-x-3.5">
                {/* Contestant Photo */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[#1E293B] bg-[#0B0F19]">
                  <img
                    src={nominee.photo_url}
                    alt={nominee.name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  {isVotedForThis && (
                    <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-white truncate">{nominee.name}</span>
                    {nominee.native_name && (
                      <span className="text-[10px] text-gray-400 bg-[#0B0F19] px-1.5 py-0.5 rounded border border-[#1E293B]">
                        {nominee.native_name}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{nominee.occupation}</p>

                  {/* Percentage Progress Bar (Visible once voted) */}
                  {hasVotedToday ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-gray-300">
                          {nominee.vote_count?.toLocaleString()} votes
                        </span>
                        <span className="font-bold text-amber-400 font-mono">
                          {voteShare.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0B0F19] h-2.5 rounded-full overflow-hidden border border-[#1E293B]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            index === 0
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                              : 'bg-gradient-to-r from-pink-500 to-purple-400'
                          }`}
                          style={{ width: `${Math.max(voteShare, 2)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onVote(nominee.id)}
                      disabled={isVoting}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 fill-black" />
                      <span>{isVoting ? 'Submitting...' : 'Save ' + nominee.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Share CTA if voted for this candidate */}
              {hasVotedToday && isVotedForThis && (
                <div className="bg-[#0B0F19]/80 px-3.5 py-2 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your vote today</span>
                  </span>
                  <button
                    onClick={() => handleShare(nominee.name)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-green-400 bg-green-500/10 hover:bg-green-500/20 px-2.5 py-1 rounded-lg border border-green-500/30 transition-all active:scale-95"
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
