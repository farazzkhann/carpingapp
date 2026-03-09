import { api, tokenStorage } from './api';
import type { User, ApiResponse } from '../types';

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
    await tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    return res.data.user;
  },

  async login(payload: LoginPayload): Promise<User> {
    const res = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
    await tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    return res.data.user;
  },

  async logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Ignore logout API errors — tokens cleared regardless
      }
    }
    await tokenStorage.clearTokens();
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return res.message ?? 'Reset email sent';
  },

  async updateProfile(payload: { fullName?: string; phone?: string }): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/auth/profile', payload);
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};
