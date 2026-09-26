'use client';

import React, { useState } from 'react';
import { X, User, Bell, Check, Smartphone } from 'lucide-react';
import { updateDeviceAccount } from '../lib/device';
import { useTheme } from '../context/ThemeContext';

export default function DeviceAccountModal({ isOpen, onClose, deviceAccount, onUpdate }) {
  const { isLight } = useTheme();
  const [nickname, setNickname] = useState(deviceAccount?.nickname || '');
  const [selectedColor, setSelectedColor] = useState(deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914'));
  const [email, setEmail] = useState(deviceAccount?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const colors = isLight
    ? ['#00A8E1', '#0073B1', '#0284C7', '#2563EB', '#7C3AED', '#059669']
    : ['#E50914', '#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6'];

  const handleSave = (e) => {
    e.preventDefault();
    updateDeviceAccount({ nickname, color: selectedColor, email });
    if (onUpdate) {
      onUpdate({ ...deviceAccount, nickname, color: selectedColor, email });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in ${
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

        <div className="flex items-center space-x-2 mb-1">
          <Smartphone className={`w-5 h-5 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-sm font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Device Account Pass
          </h3>
        </div>
        <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
          No sign-in required! Your device ID gives you instant voting & chat access.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nickname Input */}
          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-gray-300'
              }`}
            >
              Fan Nickname (Appears in live chat)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. BB_Fan_4821"
              maxLength={24}
              required
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                  : 'bg-black/60 border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
              }`}
            />
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label
              className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-gray-300'
              }`}
            >
              Choose Avatar Accent
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

          {/* Optional Email Linking */}
          <div className={`pt-2 border-t ${isLight ? 'border-sky-100' : 'border-[#2A2A2A]'}`}>
            <div className="flex items-center space-x-1.5 text-xs font-bold mb-1">
              <Bell className={`w-3.5 h-3.5 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
              <span className={isLight ? 'text-slate-800' : 'text-gray-200'}>
                Eviction Alerts (Optional)
              </span>
            </div>
            <p className={`text-[10px] mb-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Add your email if you wish to receive weekend eviction results and nomination alerts.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com (Optional)"
              className={`w-full rounded-xl px-3.5 py-2 text-xs outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                  : 'bg-black/60 border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
              }`}
            />
          </div>

          {/* Save Button */}
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
              <span>Update Device Profile</span>
            )}
          </button>
        </form>

        <p className={`text-[9px] text-center mt-3 font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
          Device Token: {deviceAccount?.deviceId?.slice(0, 16)}...
        </p>
      </div>
    </div>
  );
}

