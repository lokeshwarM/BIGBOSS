'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AdminSeasonManager from '../../components/admin/AdminSeasonManager';
import AdminContestantManager from '../../components/admin/AdminContestantManager';
import AdminPollManager from '../../components/admin/AdminPollManager';
import AdminModerationManager from '../../components/admin/AdminModerationManager';
import DeviceAccountModal from '../../components/DeviceAccountModal';
import { AuroraGlow } from '../../components/effects';
import { fetchAdminData } from '../../lib/api';
import { getDeviceAccount } from '../../lib/device';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Users, Vote, Calendar, RefreshCw, ShieldAlert, Lock, LogIn } from 'lucide-react';

export default function AdminPage() {
  const { isLight } = useTheme();
  const { user, isAdmin, loginWithDev, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('contestants');
  const [adminData, setAdminData] = useState({ shows: [], seasons: [], contestants: [], polls: [] });
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [authError, setAuthError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminData();
      setAdminData(data);
      setAuthError('');
    } catch (err) {
      console.warn('Failed to load admin data:', err);
      setAuthError(err.message || 'Unauthorized');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
    loadData();
  }, [isAdmin, user]);

  const handleAdminSecretLogin = (e) => {
    e.preventDefault();
    if (!adminSecretInput.trim()) return;
    localStorage.setItem('bigboss_admin_secret', adminSecretInput.trim());
    loadData();
  };

  const handleOneTapAdminAuth = async () => {
    try {
      const res = await loginWithDev({
        email: 'admin@bigboss.community',
        role: 'admin',
        nickname: 'Admin_Master',
      });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert('Admin login error: ' + err.message);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-300 ${
        isLight
          ? 'text-[#0F172A] selection:bg-[#00A8E1] selection:text-white'
          : 'bg-[#141414] text-white selection:bg-[#E50914] selection:text-white'
      }`}
    >
      <AuroraGlow />
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4 z-10">
        {/* Admin Header */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between border transition-all ${
            isLight
              ? 'bg-gradient-to-r from-white via-white to-[#F0F7FF] border-[#CDE5FA] shadow-md shadow-sky-900/5'
              : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                isLight
                  ? 'bg-sky-50 border-[#CDE5FA] text-[#0073B1]'
                  : 'bg-[#E50914]/20 border-[#E50914]/40 text-[#E50914]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h1
                className={`text-sm font-black uppercase tracking-wider ${
                  isLight ? 'text-[#0F172A]' : 'text-white'
                }`}
              >
                BIGBOSS Studio Admin
              </h1>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {isAdmin ? 'Master Administrator Session Active' : 'Authenticate to manage show lifecycle'}
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isLight
                ? 'bg-white border-[#CDE5FA] text-slate-700 hover:text-[#0073B1] hover:border-[#00A8E1] shadow-sm'
                : 'bg-black border-[#2A2A2A] text-gray-300 hover:text-white'
            }`}
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Admin Gate if not authorized and loading returned error */}
        {authError && !isAdmin && (
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-black/60 border-red-900/40 text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-wider">Admin Authorization Required</h2>
            </div>
            <p className="text-[11px] leading-relaxed">
              This area controls real shows, active weekly nomination voting, evictions, and content moderation. You must be an authorized admin.
            </p>

            <form onSubmit={handleAdminSecretLogin} className="space-y-2 pt-1">
              <input
                type="password"
                placeholder="Enter ADMIN_SECRET..."
                value={adminSecretInput}
                onChange={(e) => setAdminSecretInput(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-xs bg-black/40 border border-white/20 text-white outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs"
              >
                Authenticate with Secret
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                onClick={handleOneTapAdminAuth}
                className="text-[11px] text-blue-400 hover:underline flex items-center justify-center space-x-1 mx-auto"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Or Quick Authenticate as Admin Role</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Buttons */}
        <div
          className={`grid grid-cols-4 gap-1 p-1 rounded-xl border transition-colors ${
            isLight ? 'bg-[#E2F0FD] border-[#CDE5FA]' : 'bg-[#181818] border-[#2A2A2A]'
          }`}
        >
          <button
            onClick={() => setActiveTab('contestants')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'contestants'
                ? isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#E50914] text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Contestants</span>
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'polls'
                ? isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#E50914] text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Polls</span>
          </button>
          <button
            onClick={() => setActiveTab('seasons')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'seasons'
                ? isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#E50914] text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Seasons</span>
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'moderation'
                ? isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] text-white shadow-md shadow-sky-500/20'
                  : 'bg-[#E50914] text-white shadow-md'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Moderate</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'contestants' && (
          <AdminContestantManager
            seasons={adminData.seasons}
            contestants={adminData.contestants}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'polls' && (
          <AdminPollManager
            seasons={adminData.seasons}
            contestants={adminData.contestants}
            polls={adminData.polls}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'seasons' && (
          <AdminSeasonManager
            shows={adminData.shows}
            onSeasonCreated={loadData}
          />
        )}

        {activeTab === 'moderation' && (
          <AdminModerationManager />
        )}
      </main>

      <DeviceAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deviceAccount={deviceAccount}
        onUpdate={(updated) => setDeviceAccount(updated)}
      />
    </div>
  );
}
