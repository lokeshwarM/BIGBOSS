'use client';

import React, { useState } from 'react';
import { UserPlus, Trash2, Edit3, Check, X, Users, AlertCircle } from 'lucide-react';
import { adminCreateContestant, adminUpdateContestant, adminDeleteContestant } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminContestantManager({ seasons, contestants, onRefresh }) {
  const { isLight } = useTheme();
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasons?.[0]?.id || '');
  const [name, setName] = useState('');
  const [nativeName, setNativeName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [occupation, setOccupation] = useState('');
  const [status, setStatus] = useState('in_house');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const activeSeasonId = selectedSeasonId || seasons?.[0]?.id || '';
  const filteredContestants = contestants?.filter((c) => c.season_id === activeSeasonId) || [];

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setName(c.name);
    setNativeName(c.native_name || '');
    setPhotoUrl(c.photo_url || '');
    setOccupation(c.occupation || '');
    setStatus(c.status || 'in_house');
    setMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setNativeName('');
    setPhotoUrl('');
    setOccupation('');
    setStatus('in_house');
    setMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!activeSeasonId) {
      setErrorMessage('Please select or create a season first from the Seasons tab.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');

    try {
      const payload = {
        season_id: activeSeasonId,
        name: name.trim(),
        native_name: nativeName.trim(),
        photo_url: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        occupation: occupation.trim() || 'Contestant',
        status,
      };

      if (editingId) {
        await adminUpdateContestant(editingId, payload);
        setMessage(`✅ Contestant "${name}" updated successfully!`);
        setEditingId(null);
      } else {
        await adminCreateContestant(payload);
        setMessage(`✅ Contestant "${name}" added to season!`);
      }

      setName('');
      setNativeName('');
      setPhotoUrl('');
      setOccupation('');
      setStatus('in_house');

      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, contestantName) => {
    if (!confirm(`Are you sure you want to permanently remove "${contestantName}" from this season?`)) return;

    setDeletingId(id);
    setMessage('');
    setErrorMessage('');

    try {
      await adminDeleteContestant(id);
      setMessage(`🗑️ Contestant "${contestantName}" removed.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMessage(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {editingId ? (
            <Edit3 className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          ) : (
            <UserPlus className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          )}
          <h3
            className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            {editingId ? 'Edit Contestant' : 'Add Contestants'}
          </h3>
        </div>

        {editingId && (
          <button
            onClick={handleCancelEdit}
            className="text-[10px] text-gray-400 hover:text-white flex items-center space-x-0.5 border border-white/10 px-2 py-0.5 rounded-md"
          >
            <X className="w-3 h-3" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {(!seasons || seasons.length === 0) && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No seasons exist yet. Please go to the <strong>Seasons</strong> tab to create a season first before adding contestants!</span>
        </div>
      )}

      {/* Target Season Selector */}
      <div>
        <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Target Season
        </label>
        <select
          value={activeSeasonId}
          disabled={!!editingId || !seasons || seasons.length === 0}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          className={`w-full rounded-xl px-3 py-2 text-xs outline-none border transition-colors ${
            isLight
              ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
              : 'bg-[#121212] border-[#2A2A2A] text-white'
          }`}
        >
          {seasons?.length === 0 ? (
            <option value="">No seasons available (Create in Seasons tab)</option>
          ) : (
            seasons?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.show_slug})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-3 text-xs p-3.5 rounded-xl border transition-colors ${
          editingId
            ? isLight
              ? 'bg-blue-50/70 border-blue-300'
              : 'bg-blue-950/20 border-blue-600/40'
            : isLight
            ? 'bg-[#F8FAFD] border-[#D0E4F7]'
            : 'bg-[#121212] border-[#2A2A2A]'
        }`}
      >
        {editingId && (
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-400 mb-1">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editing mode: Updating existing contestant</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Nagarjuna Akkineni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Native Name (Regional)
            </label>
            <input
              type="text"
              placeholder="e.g. అక్కినేని నాగార్జున"
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Occupation
            </label>
            <input
              type="text"
              placeholder="e.g. Actor, Model, Singer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
                  : 'bg-[#181818] border-[#2A2A2A] text-white'
              }`}
            >
              <option value="in_house">In House (Active)</option>
              <option value="evicted">Evicted</option>
              <option value="winner">Winner</option>
              <option value="runner_up">Runner Up</option>
              <option value="walkout">Walkout</option>
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Photo Image URL
          </label>
          <input
            type="url"
            placeholder="https://... (direct image link or Unsplash)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className={`w-full rounded-lg px-2.5 py-1.5 outline-none text-[11px] border transition-colors ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                : 'bg-[#181818] border-[#2A2A2A] text-white focus:border-[#E50914]'
            }`}
          />
        </div>

        {message && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex space-x-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg text-white font-black flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 ${
              isLight
                ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
                : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
            }`}
          >
            {editingId ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Contestant' : 'Add Contestant'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-lg border text-xs font-bold text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Contestants List */}
      <div>
        <div className={`flex justify-between items-center text-[11px] font-bold mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          <span>Current Contestants in Season ({filteredContestants.length}):</span>
          <span className="text-[10px] text-gray-500 font-normal">Click trash to remove • Click edit to update</span>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filteredContestants.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic py-3 text-center">No contestants in this season yet.</p>
          ) : (
            filteredContestants.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl p-2.5 flex items-center justify-between border transition-all ${
                  editingId === c.id
                    ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500'
                    : isLight
                    ? 'bg-white border-[#D0E4F7] shadow-sm hover:border-[#00A8E1]'
                    : 'bg-[#121212] border-[#2A2A2A] hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={c.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={c.name}
                    className="w-8 h-8 rounded-lg object-cover border border-white/10"
                  />
                  <div>
                    <span className={`block font-bold text-xs ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {c.name} {c.native_name && <span className="opacity-60 text-[10px]">({c.native_name})</span>}
                    </span>
                    <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {c.occupation || 'Contestant'} •{' '}
                      <strong
                        className={`font-semibold ${
                          c.status === 'in_house'
                            ? 'text-emerald-500'
                            : c.status === 'winner'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {c.status}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(c)}
                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Edit Contestant"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Contestant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
