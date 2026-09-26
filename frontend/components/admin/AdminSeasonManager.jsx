'use client';

import React, { useState } from 'react';
import { PlusCircle, Calendar } from 'lucide-react';
import { adminCreateSeason } from '../../lib/api';

export default function AdminSeasonManager({ shows, onSeasonCreated }) {
  const [showSlug, setShowSlug] = useState(shows?.[0]?.slug || 'telugu');
  const [seasonNumber, setSeasonNumber] = useState(10);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [year, setYear] = useState(2026);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const generatedTitle = title || `Bigg Boss ${showSlug.toUpperCase()} Season ${seasonNumber}`;
      const payload = {
        show_slug: showSlug,
        season_number: parseInt(seasonNumber, 10),
        title: generatedTitle,
        tagline,
        year: parseInt(year, 10),
        status: 'ongoing',
      };

      const result = await adminCreateSeason(payload);
      if (result) {
        setMessage('✅ Season created successfully!');
        if (onSeasonCreated) onSeasonCreated();
        setTitle('');
        setTagline('');
      }
    } catch (err) {
      setMessage('❌ Failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 shadow-lg">
      <div className="flex items-center space-x-2 text-amber-400 mb-3">
        <Calendar className="w-4 h-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Create New Season</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Language Show</label>
            <select
              value={showSlug}
              onChange={(e) => setShowSlug(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-2.5 py-2 text-white outline-none"
            >
              {shows?.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.language})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Season Number</label>
            <input
              type="number"
              min="1"
              max="50"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value)}
              required
              className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-2.5 py-2 text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Custom Title (Optional)</label>
          <input
            type="text"
            placeholder={`e.g. Bigg Boss ${showSlug.toUpperCase()} Season ${seasonNumber}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tagline (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Entertainment Ki Baap"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>

        {message && <p className="text-xs font-semibold">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isSubmitting ? 'Creating...' : 'Create Season'}</span>
        </button>
      </form>
    </div>
  );
}
