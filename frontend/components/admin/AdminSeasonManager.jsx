'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Edit3, Trash2, Check, X, Mic, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { adminCreateSeason, adminUpdateSeason, adminDeleteSeason } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminSeasonManager({
  shows = [],
  seasons = [],
  initialShowSlug,
  onSeasonCreated,
  onRefresh,
}) {
  const { isLight } = useTheme();

  const safeShows = Array.isArray(shows) ? shows : [];
  const safeSeasons = Array.isArray(seasons) ? seasons : [];

  // Filter state for seasons list
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Form state
  const [showSlug, setShowSlug] = useState(initialShowSlug || safeShows[0]?.slug || 'telugu');
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [tagline, setTagline] = useState('');
  const [year, setYear] = useState(2026);
  const [status, setStatus] = useState('ongoing');

  // Edit / Delete states
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Update showSlug if initialShowSlug or shows change
  useEffect(() => {
    if (initialShowSlug) {
      setShowSlug(initialShowSlug);
    } else if (safeShows.length > 0 && !showSlug) {
      setShowSlug(safeShows[0].slug);
    }
  }, [initialShowSlug, safeShows]);

  // Filter seasons list
  const filteredSeasons = safeSeasons.filter((s) => {
    if (!s) return false;
    if (selectedFilter === 'all') return true;
    const show = safeShows.find((sh) => sh.slug === selectedFilter);
    return s.show_slug === selectedFilter || (show && s.show_id === show.id);
  });

  const handleStartEdit = (season) => {
    setEditingId(season.id);
    const matchedShow =
      safeShows.find((sh) => sh.id === season.show_id) ||
      safeShows.find((sh) => sh.slug === season.show_slug);

    if (matchedShow) {
      setShowSlug(matchedShow.slug);
    } else if (season.show_slug) {
      setShowSlug(season.show_slug);
    }
    setSeasonNumber(season.season_number || 1);
    setTitle(season.title || '');
    setHostName(season.host_name || '');
    setTagline(season.tagline || '');
    setYear(season.year || 2026);
    setStatus(season.status || 'ongoing');
    setMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setHostName('');
    setTagline('');
    setSeasonNumber(1);
    setYear(2026);
    setStatus('ongoing');
    setMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setErrorMessage('');

    try {
      const selectedShowObj = safeShows.find((s) => s.slug === showSlug);
      const showName = selectedShowObj ? selectedShowObj.name : `Bigg Boss ${showSlug.toUpperCase()}`;
      const generatedTitle = title.trim() || `${showName} Season ${seasonNumber}`;

      if (editingId) {
        // Update existing season
        const payload = {
          title: generatedTitle,
          host_name: hostName.trim(),
          tagline: tagline.trim(),
          year: parseInt(year, 10),
          status,
          season_number: parseInt(seasonNumber, 10),
        };

        await adminUpdateSeason(editingId, payload);
        setMessage(`✅ Season "${generatedTitle}" updated successfully!`);
        handleCancelEdit();
      } else {
        // Create new season
        const payload = {
          show_slug: showSlug,
          season_number: parseInt(seasonNumber, 10),
          title: generatedTitle,
          host_name: hostName.trim(),
          tagline: tagline.trim(),
          year: parseInt(year, 10),
          status,
        };

        await adminCreateSeason(payload);
        setMessage(`✅ Season "${generatedTitle}" created successfully!`);
        setTitle('');
        setHostName('');
        setTagline('');
      }

      if (onRefresh) onRefresh();
      if (onSeasonCreated) onSeasonCreated();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeason = async (season) => {
    const confirmText = `Are you sure you want to permanently delete "${season.title}"?\n\nWARNING: This will delete all contestants, polls, votes, and community posts for this season!`;
    if (!window.confirm(confirmText)) return;

    setDeletingId(season.id);
    setMessage('');
    setErrorMessage('');

    try {
      await adminDeleteSeason(season.id);
      setMessage(`🗑️ Season "${season.title}" permanently deleted.`);
      if (editingId === season.id) {
        handleCancelEdit();
      }
      if (onRefresh) onRefresh();
      if (onSeasonCreated) onSeasonCreated();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {editingId ? (
            <Edit3 className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          ) : (
            <Calendar className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          )}
          <h3
            className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            {editingId ? 'Edit Season Details' : 'Create New Season'}
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

      {/* Form */}
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
            <span>Editing mode: Modifying season name, host name & settings</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Language Show
            </label>
            <select
              value={showSlug}
              disabled={!!editingId}
              onChange={(e) => setShowSlug(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
                  : 'bg-[#121212] border-[#2A2A2A] text-white'
              }`}
            >
              {safeShows.map((s) => (
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

        {/* Season Name / Title */}
        <div>
          <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Season Name / Title *
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

        {/* Host Name */}
        <div>
          <label className={`flex items-center space-x-1 text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <Mic className="w-3 h-3 text-amber-500" />
            <span>Host Name (e.g. Nagarjuna, Salman Khan, Vijay Sethupathi)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Nagarjuna Akkineni"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 outline-none border transition-colors ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                : 'bg-[#121212] border-[#2A2A2A] text-white focus:border-[#E50914]'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Year
            </label>
            <input
              type="number"
              min="2000"
              max="2035"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A] focus:border-[#00A8E1]'
                  : 'bg-[#121212] border-[#2A2A2A] text-white focus:border-[#E50914]'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Season Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] text-[#0F172A]'
                  : 'bg-[#121212] border-[#2A2A2A] text-white'
              }`}
            >
              <option value="ongoing">Ongoing (Active Voting)</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed / Archive</option>
            </select>
          </div>
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

        {message && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex space-x-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-white font-extrabold flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 ${
              isLight
                ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
                : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
            }`}
          >
            {editingId ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            <span>{isSubmitting ? 'Saving...' : editingId ? 'Update Season' : 'Create Season'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2.5 rounded-xl border text-xs font-bold text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Seasons List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <span>Manage Existing Seasons ({safeSeasons.length}):</span>
          </div>
          <span className="text-[10px] text-gray-500 font-normal">Edit host, title & year • Delete season</span>
        </div>

        {/* Filter bar */}
        {safeShows.length > 1 && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 mb-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition-colors ${
                selectedFilter === 'all'
                  ? isLight
                    ? 'bg-[#0073B1] text-white'
                    : 'bg-[#E50914] text-white'
                  : isLight
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              All ({safeSeasons.length})
            </button>
            {safeShows.map((sh) => {
              const count = safeSeasons.filter((s) => s.show_slug === sh.slug || s.show_id === sh.id).length;
              return (
                <button
                  key={sh.slug}
                  onClick={() => setSelectedFilter(sh.slug)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition-colors ${
                    selectedFilter === sh.slug
                      ? isLight
                        ? 'bg-[#0073B1] text-white'
                        : 'bg-[#E50914] text-white'
                      : isLight
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {sh.language} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredSeasons.length === 0 ? (
            <p className="text-[11px] text-gray-500 italic py-4 text-center">No seasons found for this filter.</p>
          ) : (
            filteredSeasons.map((season) => {
              const isEditingThis = editingId === season.id;
              const isDeletingThis = deletingId === season.id;
              const show = safeShows.find((sh) => sh.id === season.show_id || sh.slug === season.show_slug);

              return (
                <div
                  key={season.id}
                  className={`rounded-xl p-3 border transition-all ${
                    isEditingThis
                      ? 'ring-2 ring-blue-500 bg-blue-500/10 border-blue-500'
                      : isLight
                      ? 'bg-white border-[#D0E4F7] shadow-sm hover:border-[#00A8E1]'
                      : 'bg-[#121212] border-[#2A2A2A] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isLight ? 'bg-sky-100 text-sky-800' : 'bg-red-950/60 text-red-300 border border-red-800/40'
                          }`}
                        >
                          {show?.language || season.show_slug?.toUpperCase() || 'SHOW'} S{season.season_number}
                        </span>
                        <span className={`font-black text-xs ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                          {season.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            season.status === 'ongoing'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : season.status === 'upcoming'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {season.status}
                        </span>
                      </div>

                      {/* Host Name display */}
                      <div className="flex items-center space-x-1.5 text-[11px] text-amber-500 font-semibold">
                        <Mic className="w-3 h-3 shrink-0" />
                        <span>Host: {season.host_name || show?.host_name || 'Not specified'}</span>
                      </div>

                      {/* Extra info */}
                      <div className={`text-[10px] flex items-center space-x-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                        <span>Year: {season.year}</span>
                        {season.tagline && <span>• &ldquo;{season.tagline}&rdquo;</span>}
                        {season.total_contestants > 0 && <span>• {season.total_contestants} contestants</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleStartEdit(season)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Season Name & Host"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeason(season)}
                        disabled={isDeletingThis}
                        className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Season"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
