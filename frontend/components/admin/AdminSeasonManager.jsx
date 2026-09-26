'use client';

import React, { useState } from 'react';
import { PlusCircle, Calendar } from 'lucide-react';
import { adminCreateSeason } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSeasonManager({ shows, onSeasonCreated }) {
  const { isLight } = useTheme();
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
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isLight
          ? 'bg-gradient-to-b from-white to-[#F4F9FF] border-[#CDE5FA] shadow-lg shadow-sky-900/5 text-[#0F172A]'
          : 'bg-[#181818] border-[#2A2A2A] text-white shadow-xl'
      }`}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
        <h3
          className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          Create New Season
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Language Show
            </label>
            <select
              value={showSlug}
              onChange={(e) => setShowSlug(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
                  : 'bg-[#121212] border-[#2A2A2A] text-white'
              }`}
            >
              {shows?.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.language})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Season Number
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value)}
              required
              className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#121212] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Custom Title (Optional)
          </label>
          <input
            type="text"
            placeholder={`e.g. Bigg Boss ${showSlug.toUpperCase()} Season ${seasonNumber}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 outline-none border transition-colors ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                : 'bg-[#121212] border-[#2A2A2A] text-white focus:border-[#E50914]'
            }`}
          />
        </div>

        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Tagline (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Entertainment Ki Baap"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 outline-none border transition-colors ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                : 'bg-[#121212] border-[#2A2A2A] text-white focus:border-[#E50914]'
            }`}
          />
        </div>

        {message && <p className="text-xs font-semibold">{message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-xl text-white font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95 ${
            isLight
              ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
              : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isSubmitting ? 'Creating...' : 'Create Season'}</span>
        </button>
      </form>
    </div>
  );
}

