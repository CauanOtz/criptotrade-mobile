import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

function resolveApiBase(): string {
  const explicit = (Constants.manifest as any)?.extra?.API_BASE;
  if (explicit) return explicit.replace(/\/$/, '');

  const dbg = (Constants.manifest as any)?.debuggerHost;
  if (dbg) {
    const host = dbg.split(':')[0];
    return `http://${host}:5102`;
  }

  // Expo Android emulator
  if ((Constants as any).platform?.android) {
    return 'http://10.0.2.2:5102';
  }

  return 'http://localhost:5102';
}

const API_BASE = resolveApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from SecureStore on each request
api.interceptors.request.use(async config => {
  try {
    let token: string | null = null;
    try {
      token = await SecureStore.getItemAsync('token');
    } catch {}

    if (!token) {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          token = window.sessionStorage.getItem('token');
        }
      } catch {}
    }

    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
      try {
        const short = token.length > 20 ? token.slice(0, 8) + '...' + token.slice(-8) : token;
      } catch (e) {
      }
    }
  } catch (e) {
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
      }
    }
    return Promise.reject(err);
  }
);

export default api;
