'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Pin } from 'lucide-react';
import { PulseGlowBadge } from './effects';
import { useTheme } from '../context/ThemeContext';

export default function LiveDiscussion({ weekId, deviceAccount, apiUrl, wsUrl }) {
  const { isLight } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!weekId) return;

    fetch(`${apiUrl}/chat/${weekId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch((err) => console.error('Failed to load chat history:', err));

    try {
      const socket = new WebSocket(`${wsUrl}?week_id=${weekId}&device_id=${deviceAccount?.deviceId}`);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'NEW_CHAT_MESSAGE' && packet.payload) {
            setMessages((prev) => [...prev, packet.payload]);
          }
        } catch (e) {
          console.error('Socket message parse error:', e);
        }
      };

      return () => {
        if (socket.readyState === 1) socket.close();
      };
    } catch (err) {
      console.warn('WebSocket connect skipped:', err);
    }
  }, [weekId, apiUrl, wsUrl, deviceAccount?.deviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const payload = {
      week_id: weekId,
      device_id: deviceAccount?.deviceId || 'anon-guest',
      nickname: deviceAccount?.nickname || 'BB_Fan',
      avatar_color: deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914'),
      content: inputText.trim(),
    };

    setIsSending(true);
    setInputText('');

    try {
      const res = await fetch(`${apiUrl}/chat/${weekId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-all ${
        isLight
          ? 'bg-white/95 border-[#CDE5FA] shadow-xl shadow-sky-900/5'
          : 'bg-[#181818] border-[#2A2A2A] shadow-xl'
      }`}
    >
      {/* Discussion Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
          isLight
            ? 'bg-gradient-to-r from-[#EBF5FE] to-[#F3F8FE] border-[#D0E4F7]'
            : 'bg-[#202020] border-[#2A2A2A]'
        }`}
      >
        <div className="flex items-center space-x-2">
          <MessageSquare className={`w-4 h-4 ${isLight ? 'text-[#0073B1]' : 'text-[#E50914]'}`} />
          <h3
            className={`text-xs font-black uppercase tracking-wider ${
              isLight ? 'text-[#0F172A]' : 'text-white'
            }`}
          >
            Live Fan Chatroom
          </h3>
        </div>
        <PulseGlowBadge text="LIVE FEED" color={isLight ? '#00A8E1' : '#E50914'} />
      </div>

      {/* Messages Feed */}
      <div className="p-3.5 max-h-72 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-xs italic">
            No comments yet. Be the first fan to join the live watch conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 rounded-xl border transition-all ${
                msg.is_pinned
                  ? isLight
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50/70 border-sky-300'
                    : 'bg-[#E50914]/10 border-[#E50914]/30'
                  : isLight
                  ? 'bg-[#F8FAFD] border-[#D9EAF8]'
                  : 'bg-black/60 border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white"
                    style={{ backgroundColor: msg.avatar_color || (isLight ? '#00A8E1' : '#E50914') }}
                  >
                    {msg.nickname?.[0] || 'F'}
                  </div>
                  <span
                    className={`font-bold text-[11px] ${
                      isLight ? 'text-[#0F172A]' : 'text-gray-200'
                    }`}
                  >
                    {msg.nickname}
                  </span>
                  {msg.is_pinned && (
                    <span
                      className={`flex items-center text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isLight
                          ? 'bg-[#00A8E1]/15 text-[#0073B1]'
                          : 'bg-[#E50914]/20 text-[#E50914]'
                      }`}
                    >
                      <Pin className="w-2.5 h-2.5 mr-0.5" /> Pinned
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p
                className={`text-xs leading-relaxed break-words ${
                  isLight ? 'text-slate-700' : 'text-gray-300'
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Post Form */}
      <form
        onSubmit={handleSendMessage}
        className={`p-2.5 border-t flex space-x-2 transition-colors ${
          isLight ? 'bg-white border-[#D0E4F7]' : 'bg-black border-[#2A2A2A]'
        }`}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Comment as ${deviceAccount?.nickname || 'Guest'}...`}
          maxLength={400}
          className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none transition-all border ${
            isLight
              ? 'bg-[#F0F7FF] border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
              : 'bg-[#181818] border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
          }`}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className={`disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center transition-all active:scale-95 ${
            isLight
              ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] hover:to-[#005F94] shadow-md shadow-sky-500/20'
              : 'bg-[#E50914] hover:bg-[#b81d24]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

