'use client';

import React, { useState } from 'react';
import { Vote, Trash2, CheckCircle2, UserX } from 'lucide-react';
import { adminCreatePoll, adminEvictContestant, adminDeletePoll } from '../../lib/api';

export default function AdminPollManager({ seasons, contestants, polls, onRefresh }) {
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
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 shadow-lg space-y-4">
      <div className="flex items-center space-x-2 text-amber-400">
        <Vote className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Manage Weekly Polls</h3>
      </div>

      {/* Season Selector */}
      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Season</label>
        <select
          value={activeSeasonId}
          onChange={(e) => {
            setSelectedSeasonId(e.target.value);
            setSelectedNomineeIds([]);
          }}
          className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white outline-none"
        >
          {seasons?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.show_slug})
            </option>
          ))}
        </select>
      </div>

      {/* Create New Poll Form */}
      <form onSubmit={handleCreatePoll} className="space-y-3 text-xs bg-[#0B0F19] p-3.5 rounded-xl border border-[#1E293B]">
        <div className="flex items-center space-x-2">
          <div className="w-24">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Week #</label>
            <input
              type="number"
              min="1"
              max="25"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              required
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Poll Title</label>
            <input
              type="text"
              placeholder={`e.g. Week ${weekNumber} Eviction Poll`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Save your favourite housemate before Friday midnight"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
          />
        </div>

        {/* Nominee Selector Checkboxes */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
            Select Nominated Contestants for this Week:
          </label>
          {availableContestants.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic">No in-house contestants available. Add contestants first!</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#1E293B] rounded-lg">
              {availableContestants.map((c) => {
                const isChecked = selectedNomineeIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleToggleNominee(c.id)}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                      isChecked
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-[#131B2E] border-[#1E293B] text-gray-300'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? 'bg-amber-500 border-amber-500' : 'border-gray-500'}`}>
                      {isChecked && <CheckCircle2 className="w-3 h-3 text-black" />}
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
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          <Vote className="w-4 h-4" />
          <span>{isSubmitting ? 'Launching...' : `Launch Week ${weekNumber} Poll`}</span>
        </button>
      </form>

      {/* Existing Polls & Eviction Actions */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Season Polls ({seasonPolls.length}):
        </h4>
        <div className="space-y-2">
          {seasonPolls.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic">No polls created for this season yet.</p>
          ) : (
            seasonPolls.map((poll) => (
              <div key={poll.id} className="bg-[#0B0F19] border border-[#1E293B] p-2.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">{poll.title}</span>
                    <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${poll.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                      {poll.is_active ? 'LIVE ACTIVE' : 'CLOSED'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete Poll"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] text-gray-400">
                  <span>Nominees: {poll.nominees?.map((n) => n.name).join(', ') || 'None'}</span>
                </div>

                {/* If active, allow declaring eviction */}
                {poll.is_active && (
                  <div className="pt-2 border-t border-[#1E293B] flex items-center space-x-2">
                    <select
                      className="flex-1 bg-[#131B2E] border border-[#1E293B] rounded-lg px-2 py-1 text-[11px] text-white outline-none"
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
                      className="bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Evict</span>
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
