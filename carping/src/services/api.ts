import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const ACCESS_TOKEN_KEY = 'carping_access_token';
const REFRESH_TOKEN_KEY = 'carping_refresh_token';

// expo-secure-store is native-only; fall back to localStorage on web
const isWeb = Platform.OS === 'web';

export const tokenStorage = {
  getAccessToken: (): Promise<string | null> =>
    isWeb
      ? Promise.resolve(localStorage.getItem(ACCESS_TOKEN_KEY))
      : SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  getRefreshToken: (): Promise<string | null> =>
    isWeb
      ? Promise.resolve(localStorage.getItem(REFRESH_TOKEN_KEY))
      : SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    if (isWeb) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    }
  },

  clearTokens: async (): Promise<void> => {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    }
  },
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await tokenStorage.clearTokens();
    return null;
  }

  const json = (await res.json()) as {
    data: { accessToken: string; refreshToken: string };
  };
  await tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise(resolve => {
        refreshSubscribers.push(async (token: string) => {
          headers['Authorization'] = `Bearer ${token}`;
          const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers });
          resolve((await retryRes.json()) as T);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    if (!newToken) {
      throw new ApiRequestError('Session expired. Please log in again.', 401);
    }

    onTokenRefreshed(newToken);
    headers['Authorization'] = `Bearer ${newToken}`;
    const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!retryRes.ok) {
      const errData = (await retryRes.json()) as { error?: string };
      throw new ApiRequestError(errData.error ?? 'Request failed', retryRes.status);
    }

    return (await retryRes.json()) as T;
  }

  const data = (await res.json()) as T;

  if (!res.ok) {
    const errData = data as {
      error?: string;
      details?: { body?: Record<string, string[]> };
    };
    throw new ApiRequestError(
      errData.error ?? 'Request failed',
      res.status,
      errData.details?.body,
    );
  }

  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
