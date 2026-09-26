'use client';

import React, { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { adminCreateContestant, adminDeleteContestant } from '../../lib/api';

export default function AdminContestantManager({ seasons, contestants, onRefresh }) {
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
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 shadow-lg space-y-4">
      <div className="flex items-center space-x-2 text-amber-400">
        <UserPlus className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Add Contestants</h3>
      </div>

      {/* Season Selector */}
      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Target Season</label>
        <select
          value={activeSeasonId}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white outline-none"
        >
          {seasons?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.show_slug})
            </option>
          ))}
        </select>
      </div>

      {/* Add Contestant Form */}
      <form onSubmit={handleAdd} className="space-y-3 text-xs bg-[#0B0F19] p-3 rounded-xl border border-[#1E293B]">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Nagarjuna Akkineni"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Native Name (Regional)</label>
            <input
              type="text"
              placeholder="e.g. అక్కినేని నాగార్జున"
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value)}
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Occupation</label>
            <input
              type="text"
              placeholder="e.g. Actor, Model, Singer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none"
            >
              <option value="in_house">In House</option>
              <option value="evicted">Evicted</option>
              <option value="winner">Winner</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Photo Image URL</label>
          <input
            type="url"
            placeholder="https://... (direct image link or Unsplash)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full bg-[#131B2E] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-white outline-none text-[11px]"
          />
        </div>

        {message && <p className="text-xs font-semibold">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold flex items-center justify-center space-x-1.5 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Adding...' : 'Add Contestant'}</span>
        </button>
      </form>

      {/* Existing Contestants List */}
      <div>
        <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 mb-2">
          <span>Current Contestants in Season ({filteredContestants.length}):</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {filteredContestants.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic">No contestants added yet.</p>
          ) : (
            filteredContestants.map((c) => (
              <div
                key={c.id}
                className="bg-[#0B0F19] border border-[#1E293B] rounded-lg p-2 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <img src={c.photo_url} alt={c.name} className="w-7 h-7 rounded-md object-cover" />
                  <div>
                    <span className="block font-bold text-white text-[11px]">{c.name}</span>
                    <span className="block text-[9px] text-gray-400">{c.occupation} • {c.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
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
