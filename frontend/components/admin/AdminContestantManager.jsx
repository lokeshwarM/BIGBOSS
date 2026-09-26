'use client';

import React, { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { adminCreateContestant, adminDeleteContestant } from '../../lib/api';
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

  // Auto select first season if none selected
  const activeSeasonId = selectedSeasonId || seasons?.[0]?.id || '';
  const filteredContestants = contestants?.filter((c) => c.season_id === activeSeasonId) || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      await adminCreateContestant({
        season_id: activeSeasonId,
        name: name.trim(),
        native_name: nativeName.trim(),
        photo_url: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        occupation: occupation.trim() || 'Contestant',
        status,
      });

      setMessage('✅ Contestant added!');
      setName('');
      setNativeName('');
      setPhotoUrl('');
      setOccupation('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage('❌ Failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this contestant?')) return;
    try {
      await adminDeleteContestant(id);
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
        <UserPlus className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
        <h3
          className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          Add Contestants
        </h3>
      </div>

      {/* Season Selector */}
      <div>
        <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Target Season
        </label>
        <select
          value={activeSeasonId}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          className={`w-full rounded-xl px-3 py-2 text-xs outline-none border transition-colors ${
            isLight
              ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
              : 'bg-[#121212] border-[#2A2A2A] text-white'
          }`}
        >
          {seasons?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.show_slug})
            </option>
          ))}
        </select>
      </div>

      {/* Add Contestant Form */}
      <form
        onSubmit={handleAdd}
        className={`space-y-3 text-xs p-3.5 rounded-xl border transition-colors ${
          isLight ? 'bg-[#F8FAFD] border-[#D0E4F7]' : 'bg-[#121212] border-[#2A2A2A]'
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Full Name
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
              <option value="in_house">In House</option>
              <option value="evicted">Evicted</option>
              <option value="winner">Winner</option>
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

        {message && <p className="text-xs font-semibold">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg text-white font-black flex items-center justify-center space-x-1.5 transition-all active:scale-95 ${
            isLight
              ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
              : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Adding...' : 'Add Contestant'}</span>
        </button>
      </form>

      {/* Existing Contestants List */}
      <div>
        <div className={`flex justify-between items-center text-[11px] font-bold mb-2 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          <span>Current Contestants in Season ({filteredContestants.length}):</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {filteredContestants.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic">No contestants added yet.</p>
          ) : (
            filteredContestants.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg p-2 flex items-center justify-between border transition-colors ${
                  isLight
                    ? 'bg-white border-[#D0E4F7] shadow-sm'
                    : 'bg-[#121212] border-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <img src={c.photo_url} alt={c.name} className="w-7 h-7 rounded-md object-cover" />
                  <div>
                    <span className={`block font-bold text-[11px] ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                      {c.name}
                    </span>
                    <span className={`block text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {c.occupation} • {c.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

