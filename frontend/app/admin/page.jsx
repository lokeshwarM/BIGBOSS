'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import AdminSeasonManager from '../../components/admin/AdminSeasonManager';
import AdminContestantManager from '../../components/admin/AdminContestantManager';
import AdminPollManager from '../../components/admin/AdminPollManager';
import { fetchAdminData } from '../../lib/api';
import { getDeviceAccount } from '../../lib/device';
import { Settings, Users, Vote, Calendar, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('contestants');
  const [adminData, setAdminData] = useState({ shows: [], seasons: [], contestants: [], polls: [] });
  const [deviceAccount, setDeviceAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminData();
      setAdminData(data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setDeviceAccount(getDeviceAccount());
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      <Navbar deviceAccount={deviceAccount} onOpenAccountModal={() => {}} />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-4">
        {/* Admin Header */}
        <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">HousePulse Admin</h1>
              <p className="text-[10px] text-gray-400">Add Contestants & Control Live Polls</p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-gray-300 hover:text-white transition-all active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-[#131B2E] p-1 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('contestants')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'contestants' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contestants</span>
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'polls' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Polls</span>
          </button>
          <button
            onClick={() => setActiveTab('seasons')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              activeTab === 'seasons' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Seasons</span>
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
      </main>
    </div>
  );
}
