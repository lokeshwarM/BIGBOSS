'use client';

import React, { useState } from 'react';
import { Vote, Trash2, CheckCircle2, UserX } from 'lucide-react';
import { adminCreatePoll, adminEvictContestant, adminClosePoll, adminDeletePoll } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminPollManager({ seasons, contestants, polls, onRefresh }) {
  const { isLight } = useTheme();
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasons?.[0]?.id || '');
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNomineeIds, setSelectedNomineeIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Eviction form state
  const [evictWeekId, setEvictWeekId] = useState('');
  const [evictContestantId, setEvictContestantId] = useState('');

  const activeSeasonId = selectedSeasonId || seasons?.[0]?.id || '';
  const availableContestants = contestants?.filter((c) => c.season_id === activeSeasonId && c.status === 'in_house') || [];
  const seasonPolls = polls?.filter((p) => p.season_id === activeSeasonId) || [];

  const handleToggleNominee = (id) => {
    setSelectedNomineeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (selectedNomineeIds.length === 0) {
      alert('Please select at least one nominated contestant!');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const now = new Date();
      const ends = new Date(Date.now() + 5 * 24 * 3600 * 1000); // 5 days out (Friday night)

      const payload = {
        season_id: activeSeasonId,
        week_number: parseInt(weekNumber, 10),
        title: title || `Week ${weekNumber} Eviction Poll`,
        description: description || 'Cast your fan vote before Friday midnight!',
        starts_at: now.toISOString(),
        ends_at: ends.toISOString(),
        nominee_ids: selectedNomineeIds,
      };

      await adminCreatePoll(payload);
      setMessage('✅ Nomination poll created and activated!');
      setTitle('');
      setDescription('');
      setSelectedNomineeIds([]);
      setWeekNumber((prev) => Number(prev) + 1);
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage('❌ Failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePoll = async (pollId) => {
    if (!confirm('Are you sure you want to close this poll? Voting will stop.')) return;
    try {
      await adminClosePoll(pollId);
      alert('Poll closed successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Close poll failed: ' + err.message);
    }
  };

  const handleEvict = async (e) => {
    e.preventDefault();
    if (!evictWeekId || !evictContestantId) return;

    try {
      await adminEvictContestant(evictWeekId, {
        contestant_id: evictContestantId,
        eviction_reason: 'public_vote',
      });
      alert('Contestant marked as evicted and week closed!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Evict failed: ' + err.message);
    }
  };

  const handleDeletePoll = async (id) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    try {
      await adminDeletePoll(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all space-y-4 ${
        isLight
          ? 'bg-gradient-to-b from-white to-[#F4F9FF] border-[#CDE5FA] shadow-lg shadow-sky-900/5 text-[#0F172A]'
          : 'bg-[#181818] border-[#2A2A2A] text-white shadow-xl'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Vote className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
        <h3
          className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          Manage Weekly Polls
        </h3>
      </div>

      {(!seasons || seasons.length === 0) && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          No seasons available. Create a season in the <strong>Seasons</strong> tab first.
        </div>
      )}

      {/* Season Selector */}
      <div>
        <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Target Season
        </label>
        <select
          value={activeSeasonId}
          disabled={!seasons || seasons.length === 0}
          onChange={(e) => {
            setSelectedSeasonId(e.target.value);
            setSelectedNomineeIds([]);
          }}
          className={`w-full rounded-xl px-3 py-2 text-xs outline-none border transition-colors ${
            isLight
              ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
              : 'bg-[#121212] border-[#2A2A2A] text-white'
          }`}
        >
          {seasons?.length === 0 ? (
            <option value="">No seasons available</option>
          ) : (
            seasons?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.show_slug})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Create New Poll Form */}
      <form
        onSubmit={handleCreatePoll}
        className={`space-y-3 text-xs p-3.5 rounded-xl border transition-colors ${
          isLight ? 'bg-[#F8FAFD] border-[#D0E4F7]' : 'bg-[#121212] border-[#2A2A2A]'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-24">
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Week #
            </label>
            <input
              type="number"
              min="1"
              max="25"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              required
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
          <div className="flex-1">
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Poll Title
            </label>
            <input
              type="text"
              placeholder={`e.g. Week ${weekNumber} Eviction Poll`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. Save your favourite housemate before Friday midnight"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
            }`}
          />
        </div>

        {/* Nominee Selector Checkboxes */}
        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1.5 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Select Nominated Contestants for this Week:
          </label>
          {availableContestants.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">No in-house contestants available. Add contestants first!</p>
          ) : (
            <div
              className={`grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-lg border ${
                isLight ? 'bg-white border-[#D0E4F7]' : 'border-[#2A2A2A] bg-black/40'
              }`}
            >
              {availableContestants.map((c) => {
                const isChecked = selectedNomineeIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleToggleNominee(c.id)}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                      isChecked
                        ? isLight
                          ? 'bg-[#E0F2FE] border-[#00A8E1] text-[#0073B1] font-bold shadow-sm'
                          : 'bg-[#E50914]/20 border-[#E50914] text-white font-bold'
                        : isLight
                        ? 'bg-[#F8FAFD] border-[#D0E4F7] text-slate-700 hover:border-sky-300'
                        : 'bg-[#181818] border-[#2A2A2A] text-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isChecked
                          ? isLight
                            ? 'bg-[#00A8E1] border-[#00A8E1]'
                            : 'bg-[#E50914] border-[#E50914]'
                          : isLight
                          ? 'border-slate-400'
                          : 'border-gray-500'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[11px] truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {message && <p className="text-xs font-semibold">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting || availableContestants.length === 0}
          className={`w-full py-2.5 rounded-xl text-white font-black flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 ${
            isLight
              ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
              : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>{isSubmitting ? 'Launching...' : `Launch Week ${weekNumber} Poll`}</span>
        </button>
      </form>

      {/* Existing Polls & Eviction Actions */}
      <div>
        <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Season Polls ({seasonPolls.length}):
        </h4>
        <div className="space-y-2">
          {seasonPolls.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">No polls created for this season yet.</p>
          ) : (
            seasonPolls.map((poll) => (
              <div
                key={poll.id}
                className={`p-2.5 rounded-xl space-y-2 border transition-colors ${
                  isLight
                    ? 'bg-white border-[#D0E4F7] shadow-sm'
                    : 'bg-[#121212] border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-bold text-xs ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {poll.title}
                    </span>
                    <span
                      className={`ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        poll.is_active
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/25'
                          : isLight
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {poll.is_active ? 'LIVE ACTIVE' : 'CLOSED'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Delete Poll"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  <span>Nominees: {poll.nominees?.map((n) => n.name).join(', ') || 'None'}</span>
                </div>

                {/* If active, allow closing poll or declaring eviction */}
                {poll.is_active && (
                  <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-sky-100' : 'border-[#2A2A2A]'}`}>
                    <div className="flex items-center space-x-2">
                      <select
                        className={`flex-1 rounded-lg px-2 py-1 text-[11px] outline-none border transition-colors ${
                          isLight
                            ? 'bg-[#F8FAFD] border-[#CDE5FA] text-[#0F172A]'
                            : 'bg-[#181818] border-[#2A2A2A] text-white'
                        }`}
                        onChange={(e) => {
                          setEvictWeekId(poll.id);
                          setEvictContestantId(e.target.value);
                        }}
                      >
                        <option value="">Select Evicted Contestant...</option>
                        {poll.nominees?.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleEvict}
                        disabled={!evictContestantId || evictWeekId !== poll.id}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Evict & Archive</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleClosePoll(poll.id)}
                      className={`w-full py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                      }`}
                    >
                      Close Poll Without Eviction
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

