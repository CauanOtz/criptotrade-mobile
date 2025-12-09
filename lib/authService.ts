import { authApi, userApi } from './apiClient';
import { setToken, removeToken } from './api';
import * as SecureStore from 'expo-secure-store';

type Credentials = {
  email: string;
  password: string;
};

export async function login(credentials: Credentials) {
  const response = await authApi.login(credentials);
  const data = response.data;

  if (data?.mfaRequired) {
    const userInfo = data.userInfo ?? {
      id: data.userId ?? data.user?.id ?? null,
      email: data.email ?? data.user?.email ?? null,
      mfaType: data.mfaType ?? null,
    };

    return {
      mfaRequired: true,
      tempToken: data.tempToken ?? null,
      userInfo,
      isFirstLogin: data.isFirstLogin ?? false,
    };
  }

  const token = data?.token ?? data?.accessToken ?? null;
  if (!token) {
    throw new Error('Token not returned from server');
  }

  await setToken(token);

  // Try to fetch the user profile from /User and match by email
  try {
    const usersRes = await userApi.getusers();
    const users = usersRes.data;
    const user = users.find((u: any) => u.email === credentials.email);
    if (user) {
      try {
        await SecureStore.setItemAsync('user', JSON.stringify(user));
      } catch (e) {
        // ignore
      }
    }
    return { token, user };
  } catch (e) {
    return { token, user: null };
  }
}

export async function register(userData: any) {
  const response = await authApi.register(userData);
  const data = response.data;
  const token = data?.token ?? null;
  if (token) {
    await setToken(token);
  }
  return data;
}

export async function logout() {
  await removeToken();
}

export async function verifyMfa(payload: { code: string; tempToken: string }) {
  const response = await authApi.verifyMfa(payload);
  const data = response.data;
  const token = data?.token ?? data?.accessToken ?? null;
  if (!token) {
    throw new Error('Token not returned after MFA verification');
  }

  await setToken(token);

  const user = data?.user ?? null;
  if (user) {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch (e) {
    }
  }

  return { token, user };
}

export async function getProfileByEmail(email: string) {
  const res = await userApi.getusers();
  const users = res.data;
  return users.find((u: any) => u.email === email) ?? null;
}
