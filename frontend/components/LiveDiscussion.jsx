'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Pin } from 'lucide-react';

export default function LiveDiscussion({ weekId, deviceAccount, apiUrl, wsUrl }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Fetch initial chat history
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

    // Connect to WebSockets
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

  // Scroll to bottom on new messages
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
      avatar_color: deviceAccount?.color || '#F59E0B',
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
        // If websocket didn't broadcast yet, append locally
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
    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl overflow-hidden shadow-lg shadow-black/40">
      {/* Discussion Header */}
      <div className="px-4 py-3 bg-[#18233C] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Fan Discussion</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Anonymous Chat Live</span>
        </span>
      </div>

      {/* Messages Feed */}
      <div className="p-3.5 max-h-72 overflow-y-auto space-y-2.5 text-xs">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-6 text-xs italic">
            No comments yet. Be the first fan to start the discussion!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 rounded-xl border transition-all ${
                msg.is_pinned
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#0B0F19] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black"
                    style={{ backgroundColor: msg.avatar_color || '#F59E0B' }}
                  >
                    {msg.nickname?.[0] || 'F'}
                  </div>
                  <span className="font-bold text-gray-200 text-[11px]">{msg.nickname}</span>
                  {msg.is_pinned && (
                    <span className="flex items-center text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                      <Pin className="w-2.5 h-2.5 mr-0.5" /> Pinned
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed break-words">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Post Form */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-[#0B0F19] border-t border-[#1E293B] flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Chat as ${deviceAccount?.nickname || 'Guest'}...`}
          maxLength={400}
          className="flex-1 bg-[#131B2E] border border-[#1E293B] focus:border-amber-500/70 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
