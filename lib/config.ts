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
    const token = await SecureStore.getItemAsync('token');
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Handle 401 globally: remove stored token
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);

export default api;
