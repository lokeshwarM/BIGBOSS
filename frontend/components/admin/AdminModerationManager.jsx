'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Trash2, Pin, EyeOff } from 'lucide-react';
import { adminFetchReports, adminResolveReport, adminHidePost, adminPinPost } from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminModerationManager() {
  const { isLight } = useTheme();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [actionNotice, setActionNotice] = useState('');

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await adminFetchReports(filterStatus);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterStatus]);

  const handleResolve = async (reportId, action) => {
    try {
      await adminResolveReport(reportId, action);
      setActionNotice(`Report marked as ${action}.`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    }
  };

  const handleHideContent = async (report) => {
    if (!confirm('Hide this content from the community?')) return;
    try {
      if (report.target_type === 'post') {
        await adminHidePost(report.target_id);
      }
      await adminResolveReport(report.id, 'hide_content');
      setActionNotice('Content hidden and report resolved.');
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      alert('Action failed: ' + err.message);
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
          <ShieldAlert className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Community Moderation
          </h3>
        </div>
        <div className="flex space-x-1 text-[10px]">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2 py-0.5 rounded font-bold ${
              filterStatus === 'pending'
                ? isLight
                  ? 'bg-[#00A8E1] text-white'
                  : 'bg-[#E50914] text-white'
                : 'text-gray-400'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-2 py-0.5 rounded font-bold ${
              filterStatus === 'resolved'
                ? isLight
                  ? 'bg-[#00A8E1] text-white'
                  : 'bg-[#E50914] text-white'
                : 'text-gray-400'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          {actionNotice}
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-gray-400 text-center py-6">Loading reports...</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
          <p className="font-bold">No {filterStatus} reports found!</p>
          <p className="text-[10px] text-gray-500 mt-0.5">The community discussion is healthy and clean.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-3 rounded-xl border text-xs space-y-2 transition-colors ${
                isLight ? 'bg-white border-[#D0E4F7]' : 'bg-[#121212] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold">
                  {report.target_type}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(report.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div>
                <span className="text-gray-400 text-[10px] block">Report Reason:</span>
                <p className="font-bold text-xs text-red-400">{report.reason}</p>
              </div>

              {filterStatus === 'pending' && (
                <div className="flex space-x-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => handleHideContent(report)}
                    className="flex-1 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center justify-center space-x-1"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Hide Content</span>
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'dismiss')}
                    className="flex-1 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Dismiss</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
