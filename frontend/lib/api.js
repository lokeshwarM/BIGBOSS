// Centralized API client for clean and maintainable backend communication

export function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8081/api`;
  }
  return 'http://localhost:8081/api';
}

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

export async function castVote({ weekId, contestantId, deviceId, nickname }) {
  const res = await fetch(`${getApiBase()}/polls/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch poll');
  return res.json();
}

export async function fetchChat(weekId) {
  const res = await fetch(`${getApiBase()}/chat/${weekId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function postChatMessage({ weekId, deviceId, nickname, avatarColor, content }) {
  const res = await fetch(`${getApiBase()}/chat/${weekId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
// ADMIN API CALLS
// ===================================================================

export async function fetchAdminData() {
  const res = await fetch(`${getApiBase()}/admin/data`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch admin data');
  return res.json();
}

export async function adminCreateSeason(data) {
  const res = await fetch(`${getApiBase()}/admin/seasons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminCreateContestant(data) {
  const res = await fetch(`${getApiBase()}/admin/contestants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteContestant(id) {
  const res = await fetch(`${getApiBase()}/admin/contestants/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function adminCreatePoll(data) {
  const res = await fetch(`${getApiBase()}/admin/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminEvictContestant(weekId, data) {
  const res = await fetch(`${getApiBase()}/admin/polls/${weekId}/evict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeletePoll(weekId) {
  const res = await fetch(`${getApiBase()}/admin/polls/${weekId}`, {
    method: 'DELETE',
  });
  return res.json();
}
