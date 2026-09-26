// Centralized API client for clean and maintainable backend communication

export function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8081/api`;
  }
  return 'http://localhost:8081/api';
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bigboss_auth_token');
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('bigboss_auth_token', token);
  } else {
    localStorage.removeItem('bigboss_auth_token');
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bigboss_auth_token');
}

function getAuthHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const adminSecret = typeof window !== 'undefined' ? localStorage.getItem('bigboss_admin_secret') : null;
  if (adminSecret) {
    headers['X-Admin-Key'] = adminSecret;
  }
  return headers;
}

// ===================================================================
// SHOWS & SEASONS
// ===================================================================

export async function fetchShows() {
  const res = await fetch(`${getApiBase()}/shows`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch shows');
  return res.json();
}

export async function fetchShowBySlug(slug) {
  const res = await fetch(`${getApiBase()}/shows/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch show');
  return res.json();
}

export async function fetchSeasonsByShow(slug) {
  const res = await fetch(`${getApiBase()}/shows/${slug}/seasons`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch seasons');
  return res.json();
}

export async function fetchSeasonDetail(slug, seasonParam) {
  const res = await fetch(`${getApiBase()}/shows/${slug}/seasons/${seasonParam}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch season details');
  return res.json();
}

// ===================================================================
// VOTING & POLLS
// ===================================================================

export async function castVote({ weekId, contestantId, deviceId, nickname }) {
  const res = await fetch(`${getApiBase()}/polls/vote`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      week_id: weekId,
      contestant_id: contestantId,
      device_id: deviceId,
      nickname: nickname,
    }),
  });
  return res.json();
}

export async function fetchPollById(weekId, deviceId) {
  const url = deviceId ? `${getApiBase()}/polls/${weekId}?device_id=${deviceId}` : `${getApiBase()}/polls/${weekId}`;
  const res = await fetch(url, { headers: getAuthHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch poll');
  return res.json();
}

// ===================================================================
// EPHEMERAL LIVE CHAT
// ===================================================================

export async function fetchChat(weekId) {
  const res = await fetch(`${getApiBase()}/chat/${weekId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function postChatMessage({ weekId, deviceId, nickname, avatarColor, content }) {
  const res = await fetch(`${getApiBase()}/chat/${weekId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      week_id: weekId,
      device_id: deviceId,
      nickname: nickname,
      avatar_color: avatarColor,
      content: content,
    }),
  });
  return res.json();
}

// ===================================================================
// AUTHENTICATION & IDENTITY
// ===================================================================

export async function loginWithGoogle({ credential, deviceId, nickname, avatarColor }) {
  const res = await fetch(`${getApiBase()}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credential,
      device_id: deviceId,
      nickname,
      avatar_color: avatarColor,
    }),
  });
  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function loginWithDev({ email, role, nickname, avatarColor, deviceId }) {
  const res = await fetch(`${getApiBase()}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      role: role || 'user',
      nickname,
      avatar_color: avatarColor,
      device_id: deviceId,
    }),
  });
  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${getApiBase()}/auth/me`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    clearAuthToken();
    return null;
  }
  return res.json();
}

export async function updateUserProfile({ nickname, avatar_color }) {
  const res = await fetch(`${getApiBase()}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ nickname, avatar_color }),
  });
  return res.json();
}

export async function logoutUser() {
  try {
    await fetch(`${getApiBase()}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    // Ignore network failure on logout
  } finally {
    clearAuthToken();
  }
}

// ===================================================================
// PERSISTENT COMMUNITY POSTS & SOCIAL OPINIONS
// ===================================================================

export async function fetchCommunityPosts({ seasonId, weekId, limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (seasonId) params.append('season_id', seasonId);
  if (weekId) params.append('week_id', weekId);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const res = await fetch(`${getApiBase()}/posts?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return { posts: [], total: 0 };
  return res.json();
}

export async function createCommunityPost({ seasonId, weekId, title, content, nickname, avatarColor }) {
  const res = await fetch(`${getApiBase()}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      season_id: seasonId,
      week_id: weekId,
      title: title || '',
      content: content,
      nickname,
      avatar_color: avatarColor,
    }),
  });
  return res.json();
}

export async function fetchPostComments(postId) {
  const res = await fetch(`${getApiBase()}/posts/${postId}/comments`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createPostComment(postId, { content, nickname, avatarColor }) {
  const res = await fetch(`${getApiBase()}/posts/${postId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
      nickname,
      avatar_color: avatarColor,
    }),
  });
  return res.json();
}

export async function reactToPost(postId, reactionType) {
  const res = await fetch(`${getApiBase()}/posts/${postId}/react`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      reaction_type: reactionType,
    }),
  });
  return res.json();
}

export async function createReport({ targetType, targetId, reason }) {
  const res = await fetch(`${getApiBase()}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      target_type: targetType,
      target_id: targetId,
      reason: reason || 'Inappropriate content',
    }),
  });
  return res.json();
}

// ===================================================================
// ADMIN API CALLS
// ===================================================================

export async function fetchAdminData() {
  const res = await fetch(`${getApiBase()}/admin/data`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch admin data (unauthorized or network error)');
  return res.json();
}

export async function adminCreateSeason(data) {
  const res = await fetch(`${getApiBase()}/admin/seasons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to create season');
  return resData;
}

export async function adminUpdateSeason(id, data) {
  const res = await fetch(`${getApiBase()}/admin/seasons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to update season');
  return resData;
}

export async function adminDeleteSeason(id) {
  const res = await fetch(`${getApiBase()}/admin/seasons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to delete season');
  return resData;
}

export async function adminCreateContestant(data) {
  const res = await fetch(`${getApiBase()}/admin/contestants`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to create contestant');
  return resData;
}

export async function adminUpdateContestant(id, data) {
  const res = await fetch(`${getApiBase()}/admin/contestants/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to update contestant');
  return resData;
}

export async function adminDeleteContestant(id) {
  const res = await fetch(`${getApiBase()}/admin/contestants/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to delete contestant');
  return resData;
}

export async function adminCreatePoll(data) {
  const res = await fetch(`${getApiBase()}/admin/polls`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminClosePoll(weekId, data = {}) {
  const res = await fetch(`${getApiBase()}/admin/polls/${weekId}/close`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminEvictContestant(weekId, data) {
  const res = await fetch(`${getApiBase()}/admin/polls/${weekId}/evict`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeletePoll(weekId) {
  const res = await fetch(`${getApiBase()}/admin/polls/${weekId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function adminPinPost(postId) {
  const res = await fetch(`${getApiBase()}/admin/posts/${postId}/pin`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function adminHidePost(postId) {
  const res = await fetch(`${getApiBase()}/admin/posts/${postId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function adminDeleteComment(commentId) {
  const res = await fetch(`${getApiBase()}/admin/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function adminFetchReports(status = 'pending') {
  const res = await fetch(`${getApiBase()}/admin/reports?status=${status}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function adminResolveReport(reportId, action) {
  const res = await fetch(`${getApiBase()}/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action }),
  });
  return res.json();
}
