'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAuthToken,
  fetchCurrentUser,
  loginWithGoogle as apiLoginWithGoogle,
  loginWithDev as apiLoginWithDev,
  updateUserProfile as apiUpdateUserProfile,
  logoutUser as apiLogoutUser,
} from '../lib/api';
import { getDeviceAccount, updateDeviceAccount } from '../lib/device';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isGuest: true,
  isLoading: true,
  loginWithGoogle: async () => {},
  loginWithDev: async () => {},
  updateProfile: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const savedToken = getAuthToken();
      if (!savedToken) {
        setUser(null);
        setToken(null);
        return;
      }
      setToken(savedToken);
      const profile = await fetchCurrentUser();
      if (profile && profile.id) {
        setUser(profile);
        // Sync community identity to localStorage device identity so UX stays seamless
        if (profile.nickname) {
          updateDeviceAccount({ nickname: profile.nickname, color: profile.avatar_color });
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Failed to restore user session:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = async (credential) => {
    const devAcc = getDeviceAccount();
    const res = await apiLoginWithGoogle({
      credential,
      deviceId: devAcc.deviceId,
      nickname: devAcc.nickname,
      avatarColor: devAcc.color,
    });

    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      if (res.user.nickname) {
        updateDeviceAccount({ nickname: res.user.nickname, color: res.user.avatar_color });
      }
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Google login failed' };
  };

  const loginWithDev = async ({ email, role, nickname, avatarColor }) => {
    const devAcc = getDeviceAccount();
    const res = await apiLoginWithDev({
      email,
      role: role || 'user',
      nickname: nickname || devAcc.nickname,
      avatarColor: avatarColor || devAcc.color,
      deviceId: devAcc.deviceId,
    });

    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      if (res.user.nickname) {
        updateDeviceAccount({ nickname: res.user.nickname, color: res.user.avatar_color });
      }
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Dev login failed' };
  };

  const updateProfile = async ({ nickname, avatar_color }) => {
    const res = await apiUpdateUserProfile({ nickname, avatar_color });
    if (res.success && res.user) {
      setUser(res.user);
      updateDeviceAccount({ nickname: res.user.nickname, color: res.user.avatar_color });
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Failed to update profile' };
  };

  const logout = async () => {
    await apiLogoutUser();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isGuest: !user,
    isLoading,
    loginWithGoogle,
    loginWithDev,
    updateProfile,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
