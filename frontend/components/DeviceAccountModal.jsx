'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, Smartphone, LogIn, LogOut, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { updateDeviceAccount } from '../lib/device';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function DeviceAccountModal({ isOpen, onClose, deviceAccount, onUpdate }) {
  const { isLight } = useTheme();
  const { user, isAuthenticated, isAdmin, loginWithGoogle, loginWithDev, updateProfile, logout } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname || deviceAccount?.nickname || '');
  const [selectedColor, setSelectedColor] = useState(user?.avatar_color || deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914'));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showDevAuth, setShowDevAuth] = useState(false);
  const [devEmail, setDevEmail] = useState('');
  const [devRole, setDevRole] = useState('user');

  useEffect(() => {
    if (user) {
      setNickname(user.nickname);
      setSelectedColor(user.avatar_color);
    } else if (deviceAccount) {
      setNickname(deviceAccount.nickname);
      setSelectedColor(deviceAccount.color);
    }
  }, [user, deviceAccount]);

  if (!isOpen) return null;

  const colors = isLight
    ? ['#00A8E1', '#0073B1', '#0284C7', '#2563EB', '#7C3AED', '#059669', '#E11D48']
    : ['#E50914', '#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#F97316'];

  const handleSave = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isAuthenticated) {
      const res = await updateProfile({ nickname, avatar_color: selectedColor });
      if (!res.success) {
        setAuthError(res.error || 'Failed to update profile');
        return;
      }
    } else {
      updateDeviceAccount({ nickname, color: selectedColor });
    }

    if (onUpdate) {
      onUpdate({ ...deviceAccount, nickname, color: selectedColor });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const emailToUse = devEmail.trim() || (devRole === 'admin' ? 'admin@bigboss.community' : `fan_${Math.floor(1000 + Math.random() * 9000)}@example.com`);
      const res = await loginWithDev({
        email: emailToUse,
        role: devRole,
        nickname: nickname || deviceAccount?.nickname,
        avatarColor: selectedColor,
      });
      if (res.success) {
        if (onUpdate && res.user) {
          onUpdate({ ...deviceAccount, nickname: res.user.nickname, color: res.user.avatar_color });
        }
      } else {
        setAuthError(res.error || 'Sign-in failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Login error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthError('');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
        isLight ? 'bg-slate-900/50' : 'bg-black/80'
      }`}
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl relative border transition-all ${
          isLight
            ? 'bg-gradient-to-b from-white via-white to-[#F0F7FF] border-[#CDE5FA] text-[#0F172A]'
            : 'bg-[#181818] border-[#2A2A2A] text-white'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full border transition-colors ${
            isLight
              ? 'bg-sky-50 border-[#CDE5FA] text-slate-500 hover:text-slate-800'
              : 'bg-black/60 border-[#2A2A2A] text-gray-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Identity Header */}
        <div className="flex items-center space-x-2 mb-1">
          <Smartphone className={`w-5 h-5 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-sm font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Fan Identity & Account
          </h3>
        </div>

        {/* Auth Status Banner */}
        <div
          className={`mt-2 mb-3.5 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
            isAuthenticated
              ? isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : isLight
              ? 'bg-sky-50/70 border-sky-200 text-slate-700'
              : 'bg-black/60 border-[#2A2A2A] text-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shadow"
              style={{ backgroundColor: selectedColor }}
            >
              {nickname?.[0] || 'F'}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs">{nickname || 'Anonymous Fan'}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                    isAdmin
                      ? 'bg-amber-500 text-black'
                      : isAuthenticated
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : isAuthenticated ? 'AUTHENTICATED' : 'GUEST'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                {isAuthenticated ? 'Persistent history active' : 'Anonymous device pass active'}
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 transition-all ${
                isLight
                  ? 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                  : 'bg-black border-red-900/60 text-red-400 hover:bg-red-950/40'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Privacy Assurance Badge */}
        <div
          className={`mb-3 px-2.5 py-1.5 rounded-lg text-[10px] flex items-center space-x-1.5 border ${
            isLight ? 'bg-blue-50/60 border-blue-200 text-blue-900' : 'bg-white/5 border-white/10 text-gray-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            <strong>100% Anonymous Public Identity:</strong> Your email and real name are never exposed. Fans only see your nickname.
          </span>
        </div>

        {authError && (
          <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
            {authError}
          </div>
        )}

        {/* Profile Customization Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-gray-300'
              }`}
            >
              Public Community Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Fan_4821"
              maxLength={24}
              required
              className={`w-full rounded-xl px-3 py-2 text-xs outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                  : 'bg-black/60 border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-gray-300'
              }`}
            >
              Avatar Accent Color
            </label>
            <div className="flex space-x-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === c
                      ? 'ring-2 ring-offset-2 ring-[#0073B1] scale-110 shadow'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-white font-black" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95 ${
              isLight
                ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/25'
                : 'bg-[#E50914] hover:bg-[#b81d24] shadow-md shadow-[#E50914]/25'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Fan Profile</span>
            )}
          </button>
        </form>

        {/* Authentication Options for Guests */}
        {!isAuthenticated && (
          <div className={`mt-3.5 pt-3 border-t ${isLight ? 'border-sky-100' : 'border-[#2A2A2A]'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Permanent Social History
              </span>
              <button
                type="button"
                onClick={() => setShowDevAuth(!showDevAuth)}
                className="text-[10px] text-blue-500 hover:underline flex items-center space-x-0.5"
              >
                <KeyRound className="w-2.5 h-2.5" />
                <span>{showDevAuth ? 'Hide sign-in' : 'Sign in / Admin'}</span>
              </button>
            </div>
            <p className={`text-[10px] mb-2.5 leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Sign in to keep your opinions, reactions, and discussions permanently saved across all devices.
            </p>

            {showDevAuth && (
              <form onSubmit={handleDevLogin} className="space-y-2 mb-2 p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">
                    Account Email (Private)
                  </label>
                  <input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="you@example.com (or leave blank for random)"
                    className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-black/60 border border-white/20 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">
                    Role Privilege
                  </label>
                  <select
                    value={devRole}
                    onChange={(e) => setDevRole(e.target.value)}
                    className="w-full rounded-lg px-2.5 py-1.5 text-xs bg-black/60 border border-white/20 text-white outline-none"
                  >
                    <option value="user">Authenticated Fan</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAuthLoading ? 'Signing In...' : 'Authenticate Account'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        <p className={`text-[9px] text-center mt-3 font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
          Device: {deviceAccount?.deviceId?.slice(0, 16)}...
        </p>
      </div>
    </div>
  );
}
