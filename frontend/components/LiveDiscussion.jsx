'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  Sparkles,
  ThumbsUp,
  Heart,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Shield,
  Flag,
  Share2,
  LogIn,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PulseGlowBadge } from './effects';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  fetchChat,
  postChatMessage,
  fetchCommunityPosts,
  createCommunityPost,
  fetchPostComments,
  createPostComment,
  reactToPost,
  createReport,
} from '../lib/api';

export default function LiveDiscussion({ weekId, seasonId, deviceAccount, apiUrl, wsUrl, onOpenAuthModal }) {
  const { isLight } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('opinions'); // 'opinions' (persistent) or 'live' (ephemeral chat)

  // Ephemeral Live Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Persistent Community Posts state
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [opinionInput, setOpinionInput] = useState('');
  const [opinionTitle, setOpinionTitle] = useState('');
  const [isPostingOpinion, setIsPostingOpinion] = useState(false);
  const [expandedComments, setExpandedComments] = useState({}); // { [postId]: comments[] }
  const [loadingComments, setLoadingComments] = useState({}); // { [postId]: bool }
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: string }
  const [showGuestAuthPrompt, setShowGuestAuthPrompt] = useState(false);
  const [opinionNotice, setOpinionNotice] = useState('');

  const wsRef = useRef(null);

  const effectiveApiUrl = apiUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8081/api` : 'http://localhost:8081/api');
  const effectiveWsUrl = wsUrl || (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8081/ws` : 'ws://localhost:8081/ws');

  // Load Initial Ephemeral Chat & Persistent Community Posts
  const loadPosts = useCallback(async () => {
    if (!weekId && !seasonId) return;
    setIsLoadingPosts(true);
    try {
      const res = await fetchCommunityPosts({ weekId, seasonId, limit: 30 });
      if (res && Array.isArray(res.posts)) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.warn('Failed to load community opinions:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [weekId, seasonId]);

  const loadChat = useCallback(async () => {
    if (!weekId) return;
    try {
      const msgs = await fetchChat(weekId);
      if (Array.isArray(msgs)) {
        setChatMessages(msgs);
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    }
  }, [weekId]);

  useEffect(() => {
    loadPosts();
    loadChat();
  }, [loadPosts, loadChat]);

  // WebSocket Connection for Realtime Updates
  useEffect(() => {
    if (!weekId) return;

    try {
      const devId = deviceAccount?.deviceId || 'anon';
      const socket = new WebSocket(`${effectiveWsUrl}?week_id=${weekId}&device_id=${devId}`);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          const { type, payload } = packet;

          if (type === 'NEW_CHAT_MESSAGE' && payload) {
            setChatMessages((prev) => [...prev, payload]);
          } else if (type === 'NEW_SOCIAL_POST' && payload) {
            setPosts((prev) => {
              if (prev.some((p) => p.id === payload.id)) return prev;
              return [payload, ...prev];
            });
          } else if (type === 'REACTION_UPDATED' && payload) {
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id === payload.post_id) {
                  return {
                    ...p,
                    like_count: payload.like_count,
                    love_count: payload.love_count,
                    agree_count: payload.agree_count,
                    disagree_count: payload.disagree_count,
                  };
                }
                return p;
              })
            );
          } else if (type === 'NEW_COMMENT' && payload) {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.post_id ? { ...p, comment_count: p.comment_count + 1 } : p))
            );
            setExpandedComments((prev) => {
              if (!prev[payload.post_id]) return prev;
              return {
                ...prev,
                [payload.post_id]: [...prev[payload.post_id], payload],
              };
            });
          } else if (type === 'POST_PINNED' && payload) {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.post_id ? { ...p, is_pinned: payload.is_pinned } : p))
            );
          } else if (type === 'POST_REMOVED' && payload) {
            setPosts((prev) => prev.filter((p) => p.id !== payload.post_id));
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
  }, [weekId, effectiveWsUrl, deviceAccount?.deviceId]);

  useEffect(() => {
    if (activeTab === 'live') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Handle Ephemeral Chat Send
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const nickname = user?.nickname || deviceAccount?.nickname || 'BB_Fan';
    const avatarColor = user?.avatar_color || deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914');
    const content = chatInput.trim();

    setIsSendingChat(true);
    setChatInput('');

    try {
      const res = await postChatMessage({
        weekId,
        deviceId: deviceAccount?.deviceId || 'anon-guest',
        nickname,
        avatarColor,
        content,
      });

      if (res && res.id) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === res.id)) return prev;
          return [...prev, res];
        });
      }
    } catch (err) {
      console.error('Failed to post chat message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle Persistent Community Opinion Post
  const handlePostOpinion = async (e) => {
    e.preventDefault();
    if (!opinionInput.trim() || isPostingOpinion) return;

    if (!isAuthenticated) {
      setShowGuestAuthPrompt(true);
      return;
    }

    setIsPostingOpinion(true);
    setOpinionNotice('');

    try {
      const res = await createCommunityPost({
        seasonId,
        weekId,
        title: opinionTitle.trim(),
        content: opinionInput.trim(),
        nickname: user?.nickname,
        avatarColor: user?.avatar_color,
      });

      if (res && res.id) {
        setPosts((prev) => [res, ...prev]);
        setOpinionInput('');
        setOpinionTitle('');
        setOpinionNotice('Opinion posted successfully!');
        setTimeout(() => setOpinionNotice(''), 3000);
      } else {
        setOpinionNotice(res?.error || 'Failed to publish opinion.');
      }
    } catch (err) {
      console.error('Failed to post opinion:', err);
      setOpinionNotice('Network error publishing opinion.');
    } finally {
      setIsPostingOpinion(false);
    }
  };

  // Handle Post Reaction (Like, Love, Agree, Disagree)
  const handleReact = async (postId, reactionType) => {
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const isSame = p.user_reaction === reactionType;
          const nextReaction = isSame ? '' : reactionType;
          let newLikes = p.like_count;
          let newLoves = p.love_count;
          let newAgrees = p.agree_count;
          let newDisagrees = p.disagree_count;

          // remove old
          if (p.user_reaction === 'like') newLikes = Math.max(0, newLikes - 1);
          if (p.user_reaction === 'love') newLoves = Math.max(0, newLoves - 1);
          if (p.user_reaction === 'agree') newAgrees = Math.max(0, newAgrees - 1);
          if (p.user_reaction === 'disagree') newDisagrees = Math.max(0, newDisagrees - 1);

          // add new if not toggle off
          if (nextReaction === 'like') newLikes++;
          if (nextReaction === 'love') newLoves++;
          if (nextReaction === 'agree') newAgrees++;
          if (nextReaction === 'disagree') newDisagrees++;

          return {
            ...p,
            user_reaction: nextReaction,
            like_count: newLikes,
            love_count: newLoves,
            agree_count: newAgrees,
            disagree_count: newDisagrees,
          };
        })
      );

      const res = await reactToPost(postId, reactionType);
      if (res && res.reactions) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  user_reaction: res.user_reaction,
                  like_count: res.reactions.like,
                  love_count: res.reactions.love,
                  agree_count: res.reactions.agree,
                  disagree_count: res.reactions.disagree,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Toggle & Load Comments for a Post
  const handleToggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }

    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const comments = await fetchPostComments(postId);
      setExpandedComments((prev) => ({ ...prev, [postId]: Array.isArray(comments) ? comments : [] }));
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const nickname = user?.nickname || deviceAccount?.nickname || 'BB_Fan';
    const avatarColor = user?.avatar_color || deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914');

    try {
      const newComment = await createPostComment(postId, {
        content: text,
        nickname,
        avatarColor,
      });

      if (newComment && newComment.id) {
        setExpandedComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }));
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
        );
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  // Report Inappropriate Content
  const handleReport = async (targetType, targetId) => {
    const reason = prompt('Please specify why this content violates community guidelines (e.g. spam, abuse):');
    if (!reason || !reason.trim()) return;

    try {
      await createReport({ targetType, targetId, reason });
      alert('Report submitted for admin review. Thank you for keeping BIGBOSS Community clean.');
    } catch (err) {
      alert('Could not submit report.');
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
      {/* Community Header with Mode Switcher */}
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
            Fan Social Community
          </h3>
        </div>

        {/* Tab Toggle: Fan Opinions vs Live Room */}
        <div
          className={`flex p-0.5 rounded-lg border text-[11px] font-bold ${
            isLight ? 'bg-white border-[#D0E4F7]' : 'bg-black/60 border-[#2A2A2A]'
          }`}
        >
          <button
            onClick={() => setActiveTab('opinions')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'opinions'
                ? isLight
                  ? 'bg-[#00A8E1] text-white shadow-sm'
                  : 'bg-[#E50914] text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Opinions ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
              activeTab === 'live'
                ? isLight
                  ? 'bg-[#00A8E1] text-white shadow-sm'
                  : 'bg-[#E50914] text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Chat</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PERSISTENT COMMUNITY OPINIONS                                */}
      {/* =================================================================== */}
      {activeTab === 'opinions' && (
        <div className="p-3.5 space-y-3">
          {/* Post Opinion Input Box */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isLight ? 'bg-[#F8FAFD] border-[#D9EAF8]' : 'bg-black/50 border-[#2A2A2A]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    backgroundColor:
                      user?.avatar_color || deviceAccount?.color || (isLight ? '#00A8E1' : '#E50914'),
                  }}
                >
                  {(user?.nickname || deviceAccount?.nickname || 'F')[0]}
                </div>
                <span className={`text-[11px] font-bold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                  Post as {user?.nickname || deviceAccount?.nickname || 'Fan'}
                </span>
                {isAuthenticated && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    PERSISTENT
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                100% Anonymous Fan Identity
              </span>
            </div>

            <form onSubmit={handlePostOpinion} className="space-y-2">
              <input
                type="text"
                value={opinionTitle}
                onChange={(e) => setOpinionTitle(e.target.value)}
                placeholder="Topic / Contestant (Optional, e.g. Who should be saved?)"
                maxLength={100}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border transition-colors ${
                  isLight
                    ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                    : 'bg-[#181818] border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
                }`}
              />
              <textarea
                value={opinionInput}
                onChange={(e) => setOpinionInput(e.target.value)}
                placeholder="Share your thoughts on this week's nominations and house drama..."
                rows={2}
                maxLength={500}
                required
                className={`w-full rounded-lg p-2.5 text-xs outline-none border resize-none transition-colors ${
                  isLight
                    ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                    : 'bg-[#181818] border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
                }`}
              />

              <div className="flex items-center justify-between pt-1">
                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                  {500 - opinionInput.length} chars remaining
                </span>
                <button
                  type="submit"
                  disabled={!opinionInput.trim() || isPostingOpinion}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 ${
                    isLight
                      ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] shadow-sm'
                      : 'bg-[#E50914] hover:bg-[#b81d24] shadow-sm'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>{isPostingOpinion ? 'Publishing...' : 'Publish Opinion'}</span>
                </button>
              </div>
            </form>

            {opinionNotice && (
              <p className="mt-2 text-[11px] text-amber-400 font-semibold">{opinionNotice}</p>
            )}

            {/* Guest Sign-in Prompt if guest clicks to post */}
            {showGuestAuthPrompt && !isAuthenticated && (
              <div
                className={`mt-2.5 p-3 rounded-xl border animate-fade-in ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">Keep Your Opinions Permanent</span>
                  <button
                    onClick={() => setShowGuestAuthPrompt(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed mb-2.5">
                  Guest posts are ephemeral to prevent spam. Sign in with one tap to keep your discussions permanently saved!
                  Your email is strictly private—only your fan nickname is displayed.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowGuestAuthPrompt(false);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In With Account</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowGuestAuthPrompt(false);
                      setActiveTab('live');
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                      isLight ? 'bg-white border-amber-200 text-amber-900' : 'bg-black/60 border-white/20 text-gray-300'
                    }`}
                  >
                    Post in Live Chat Instead
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Posts Feed */}
          {isLoadingPosts ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading fan opinions...</div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 italic">
              No fan opinions posted yet. Share your thoughts on this week&apos;s contestants!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`p-3 rounded-xl border transition-all ${
                  post.is_pinned
                    ? isLight
                      ? 'bg-gradient-to-r from-sky-50 to-blue-50/70 border-sky-300 shadow-sm'
                      : 'bg-[#E50914]/10 border-[#E50914]/30'
                    : isLight
                    ? 'bg-white border-[#D9EAF8] shadow-sm'
                    : 'bg-black/60 border-[#2A2A2A]'
                }`}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                      style={{ backgroundColor: post.avatar_color || (isLight ? '#00A8E1' : '#E50914') }}
                    >
                      {post.nickname?.[0] || 'F'}
                    </div>
                    <span className={`font-bold text-xs ${isLight ? 'text-[#0F172A]' : 'text-gray-200'}`}>
                      {post.nickname}
                    </span>
                    {post.is_pinned && (
                      <span
                        className={`flex items-center text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isLight ? 'bg-[#00A8E1]/15 text-[#0073B1]' : 'bg-[#E50914]/20 text-[#E50914]'
                        }`}
                      >
                        <Pin className="w-2.5 h-2.5 mr-0.5" /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={() => handleReport('post', post.id)}
                      className="text-gray-400 hover:text-red-400 p-0.5"
                      title="Report content"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Post Title & Content */}
                {post.title && (
                  <h4 className={`text-xs font-black mb-1 ${isLight ? 'text-[#0F172A]' : 'text-white'}`}>
                    {post.title}
                  </h4>
                )}
                <p
                  className={`text-xs leading-relaxed break-words whitespace-pre-wrap ${
                    isLight ? 'text-slate-700' : 'text-gray-300'
                  }`}
                >
                  {post.content}
                </p>

                {/* Reaction Actions Bar */}
                <div
                  className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isLight ? 'border-sky-100' : 'border-[#222222]'
                  }`}
                >
                  {/* Reaction Buttons */}
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {/* Like */}
                    <button
                      onClick={() => handleReact(post.id, 'like')}
                      className={`px-2 py-1 rounded-md border flex items-center space-x-1 transition-all active:scale-95 ${
                        post.user_reaction === 'like'
                          ? isLight
                            ? 'bg-blue-100 border-blue-300 text-blue-700 font-bold'
                            : 'bg-blue-950/60 border-blue-500 text-blue-300 font-bold'
                          : isLight
                          ? 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-sky-50'
                          : 'bg-black/40 border-[#2A2A2A] text-gray-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{post.like_count || 0}</span>
                    </button>

                    {/* Love */}
                    <button
                      onClick={() => handleReact(post.id, 'love')}
                      className={`px-2 py-1 rounded-md border flex items-center space-x-1 transition-all active:scale-95 ${
                        post.user_reaction === 'love'
                          ? isLight
                            ? 'bg-rose-100 border-rose-300 text-rose-700 font-bold'
                            : 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                          : isLight
                          ? 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-rose-50'
                          : 'bg-black/40 border-[#2A2A2A] text-gray-400 hover:text-white'
                      }`}
                    >
                      <Heart className="w-3 h-3" />
                      <span>{post.love_count || 0}</span>
                    </button>

                    {/* Agree */}
                    <button
                      onClick={() => handleReact(post.id, 'agree')}
                      className={`px-2 py-1 rounded-md border flex items-center space-x-1 transition-all active:scale-95 ${
                        post.user_reaction === 'agree'
                          ? isLight
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-700 font-bold'
                            : 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                          : isLight
                          ? 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-emerald-50'
                          : 'bg-black/40 border-[#2A2A2A] text-gray-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{post.agree_count || 0}</span>
                    </button>

                    {/* Disagree */}
                    <button
                      onClick={() => handleReact(post.id, 'disagree')}
                      className={`px-2 py-1 rounded-md border flex items-center space-x-1 transition-all active:scale-95 ${
                        post.user_reaction === 'disagree'
                          ? isLight
                            ? 'bg-amber-100 border-amber-300 text-amber-700 font-bold'
                            : 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                          : isLight
                          ? 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-amber-50'
                          : 'bg-black/40 border-[#2A2A2A] text-gray-400 hover:text-white'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>{post.disagree_count || 0}</span>
                    </button>
                  </div>

                  {/* Comments Toggle Button */}
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                      isLight ? 'text-slate-600 hover:text-[#0073B1]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comment_count || 0} Replies</span>
                    {expandedComments[post.id] ? (
                      <ChevronUp className="w-3 h-3 ml-0.5" />
                    ) : (
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Expandable Comments Section */}
                {expandedComments[post.id] && (
                  <div
                    className={`mt-2.5 pt-2.5 border-t space-y-2 animate-fade-in ${
                      isLight ? 'border-sky-100' : 'border-[#222222]'
                    }`}
                  >
                    {loadingComments[post.id] ? (
                      <p className="text-[10px] text-gray-400 italic">Loading replies...</p>
                    ) : expandedComments[post.id].length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">No replies yet. Start the conversation!</p>
                    ) : (
                      expandedComments[post.id].map((c) => (
                        <div
                          key={c.id}
                          className={`p-2 rounded-lg text-xs border ${
                            isLight ? 'bg-sky-50/50 border-sky-100' : 'bg-black/40 border-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5">
                              <div
                                className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white"
                                style={{ backgroundColor: c.avatar_color || (isLight ? '#00A8E1' : '#E50914') }}
                              >
                                {c.nickname?.[0] || 'F'}
                              </div>
                              <span className="font-bold text-[11px]">{c.nickname}</span>
                            </div>
                            <span className="text-[9px] text-gray-500 font-mono">
                              {new Date(c.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}

                    {/* Inline Reply Input */}
                    <div className="flex space-x-1.5 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder={`Reply as ${user?.nickname || deviceAccount?.nickname || 'Fan'}...`}
                        maxLength={250}
                        className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none border transition-colors ${
                          isLight
                            ? 'bg-white border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                            : 'bg-black/60 border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
                        }`}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 ${
                          isLight ? 'bg-[#00A8E1] hover:bg-[#0096CC]' : 'bg-[#E50914] hover:bg-[#b81d24]'
                        }`}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: EPHEMERAL LIVE CHAT (FAST LIVE WATCH)                        */}
      {/* =================================================================== */}
      {activeTab === 'live' && (
        <div>
          {/* Ephemeral Notice Banner */}
          <div
            className={`px-3.5 py-1.5 text-[10px] flex items-center justify-between border-b ${
              isLight ? 'bg-sky-50 border-sky-100 text-sky-800' : 'bg-black/40 border-[#2A2A2A] text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>Live Stream Chat:</strong> Realtime ephemeral discussion. Messages are temporary for high-frequency watch discussions.
              </span>
            </div>
            <PulseGlowBadge text="LIVE" color={isLight ? '#00A8E1' : '#E50914'} />
          </div>

          {/* Messages Feed */}
          <div className="p-3.5 max-h-72 overflow-y-auto space-y-2 text-xs">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-xs italic">
                No chat messages yet. Send a message to get the live room buzzing!
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl border transition-all ${
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
                        style={{
                          backgroundColor: msg.avatar_color || (isLight ? '#00A8E1' : '#E50914'),
                        }}
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
                    <span
                      className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendChatMessage}
            className={`p-2.5 border-t flex space-x-2 transition-colors ${
              isLight ? 'bg-white border-[#D0E4F7]' : 'bg-black border-[#2A2A2A]'
            }`}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Live chat as ${user?.nickname || deviceAccount?.nickname || 'Guest'}...`}
              maxLength={300}
              className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none transition-all border ${
                isLight
                  ? 'bg-[#F0F7FF] border-[#CDE5FA] focus:border-[#00A8E1] text-[#0F172A] placeholder-slate-400'
                  : 'bg-[#181818] border-[#2A2A2A] focus:border-[#E50914] text-white placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isSendingChat}
              className={`disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center transition-all active:scale-95 ${
                isLight
                  ? 'bg-gradient-to-r from-[#00A8E1] to-[#0073B1] hover:from-[#0096CC] shadow-md'
                  : 'bg-[#E50914] hover:bg-[#b81d24]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
