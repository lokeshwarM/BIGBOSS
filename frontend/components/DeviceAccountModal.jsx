'use client';

import React, { useState } from 'react';
import { X, User, Bell, Check, Smartphone } from 'lucide-react';
import { updateDeviceAccount } from '../lib/device';

export default function DeviceAccountModal({ isOpen, onClose, deviceAccount, onUpdate }) {
  const [nickname, setNickname] = useState(deviceAccount?.nickname || '');
  const [selectedColor, setSelectedColor] = useState(deviceAccount?.color || '#F59E0B');
  const [email, setEmail] = useState(deviceAccount?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const colors = ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#F97316'];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131B2E] border border-[#1E293B] w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full bg-[#0B0F19] border border-[#1E293B]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-amber-400 mb-1">
          <Smartphone className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Device Account Pass</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          No sign-in required! Your device ID gives you instant voting & chat access.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nickname Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Fan Nickname (Appears in live chat)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. BB_Fan_4821"
              maxLength={24}
              required
              className="w-full bg-[#0B0F19] border border-[#1E293B] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            />
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Choose Avatar Accent
            </label>
            <div className="flex space-x-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-black font-black" />}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Email Linking */}
          <div className="pt-2 border-t border-[#1E293B]">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-200 mb-1">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Eviction Alerts (Optional)</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">
              Add your email if you wish to receive weekend eviction results and nomination alerts.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com (Optional)"
              className="w-full bg-[#0B0F19] border border-[#1E293B] focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/25 active:scale-95"
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

        <p className="text-[9px] text-gray-500 text-center mt-3 font-mono">
          Device Token: {deviceAccount?.deviceId?.slice(0, 16)}...
        </p>
      </div>
    </div>
  );
}
