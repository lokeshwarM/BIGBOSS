'use client';

// Helper to get or initialize persistent anonymous device identity
export function getDeviceAccount() {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'ssr-device',
      nickname: 'BB_Fan',
      color: '#F59E0B',
      email: '',
    };
  }

  let deviceId = localStorage.getItem('bb_device_id');
  let nickname = localStorage.getItem('bb_nickname');
  let color = localStorage.getItem('bb_avatar_color');
  let email = localStorage.getItem('bb_user_email') || '';

  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('bb_device_id', deviceId);
  }

  if (!nickname) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    nickname = 'Fan_' + randomSuffix;
    localStorage.setItem('bb_nickname', nickname);
  }

  if (!color) {
    const colors = ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#8B5CF6', '#F97316'];
    color = colors[Math.floor(Math.random() * colors.length)];
    localStorage.setItem('bb_avatar_color', color);
  }

  return { deviceId, nickname, color, email };
}

export function updateDeviceAccount({ nickname, color, email }) {
  if (typeof window === 'undefined') return;
  if (nickname) localStorage.setItem('bb_nickname', nickname);
  if (color) localStorage.setItem('bb_avatar_color', color);
  if (email !== undefined) localStorage.setItem('bb_user_email', email);
}
