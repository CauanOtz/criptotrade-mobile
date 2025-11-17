import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://localhost:5102';

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err: any = new Error('Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function setToken(token: string) {
  try {
    await SecureStore.setItemAsync('token', token);
  } catch (e) {
    // ignore
  }
}

export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync('token');
  } catch (e) {
    // ignore
  }
}

export async function getStoredToken() {
  return getToken();
}
