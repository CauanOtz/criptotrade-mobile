import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { login, register, logout as serviceLogout, getProfileByEmail } from '@/lib/authService';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>; 
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  biometryAvailable: boolean;
  biometryEnabled: boolean;
  enableBiometry: (enabled: boolean) => Promise<boolean>;
  tryBiometricUnlock: () => Promise<boolean>;
  hasPin: boolean;
  setPin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  biometryAvailable: false,
  biometryEnabled: false,
  enableBiometry: async () => false,
  tryBiometricUnlock: async () => false,
  hasPin: false,
  setPin: async () => false,
  verifyPin: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('user');
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
          setBiometryAvailable(hasHardware && supported && supported.length > 0);
        } catch (e) {
          setBiometryAvailable(false);
        }
        try {
          const b = await SecureStore.getItemAsync('biometryEnabled');
          setBiometryEnabled(b === 'true');
        } catch (e) {
          setBiometryEnabled(false);
        }
        try {
          const p = await SecureStore.getItemAsync('biometryPin');
          setHasPin(!!p);
        } catch (e) {
          setHasPin(false);
        }
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: profile } = await login({ email, password });
      setUser(profile ?? null);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const payload = { email, password, name: name ?? '', phone: '', address: '', photo: '' };
      await register(payload);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await serviceLogout();
    try {
      await SecureStore.deleteItemAsync('user');
      // keep biometry preference but do not delete it automatically
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const enableBiometry = async (enabled: boolean) => {
    if (enabled) {
      try {
        const available = await LocalAuthentication.hasHardwareAsync();
        if (!available) return false;
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirme para ativar a biometria',
          cancelLabel: 'Cancelar',
        });
        if (result.success) {
          await SecureStore.setItemAsync('biometryEnabled', 'true');
          setBiometryEnabled(true);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    } else {
      try {
        await SecureStore.setItemAsync('biometryEnabled', 'false');
      } catch (e) {
        // ignore
      }
      setBiometryEnabled(false);
      return true;
    }
  };

  const tryBiometricUnlock = async () => {
    try {
      const enabled = (await SecureStore.getItemAsync('biometryEnabled')) === 'true';
      if (!enabled) return false;
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Use sua biometria para entrar',
        cancelLabel: 'Cancelar',
      });
      if (!res.success) return false;
      // verify stored token is still valid before restoring user
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) return false;

        // decode JWT and check exp
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        let payloadJson = '';
        if (typeof atob === 'function') {
          try {
            payloadJson = atob(parts[1]);
          } catch (e) {
            payloadJson = '';
          }
        }
        if (!payloadJson && typeof Buffer !== 'undefined') {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            payloadJson = (Buffer as any).from(parts[1], 'base64').toString('utf8');
          } catch (e) {
            payloadJson = '';
          }
        }
        if (!payloadJson) {
          // last resort: try global atob
          try {
            payloadJson = (global as any).atob(parts[1]);
          } catch (e) {
            payloadJson = '';
          }
        }
        if (!payloadJson) return false;
        const payload = JSON.parse(payloadJson) as any;
        const exp = payload?.exp;
        if (!exp) return false;
        const now = Math.floor(Date.now() / 1000);
        // allow a small clock skew of 30 seconds
        if (exp < now - 30) {
          // token expired - remove stored credentials
          try {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
          } catch (e) {
            // ignore
          }
          setUser(null);
          return false;
        }

        const raw = await SecureStore.getItemAsync('user');
        if (raw) {
          setUser(JSON.parse(raw));
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const setPin = async (pin: string) => {
    try {
      if (!pin || pin.length < 4) return false;
      await SecureStore.setItemAsync('biometryPin', pin);
      setHasPin(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const verifyPin = async (pin: string) => {
    try {
      const stored = await SecureStore.getItemAsync('biometryPin');
      const match = stored === pin;
      if (!match) return false;
      // if PIN matches, try to restore stored user session
      const raw = await SecureStore.getItemAsync('user');
      if (raw) {
        try {
          setUser(JSON.parse(raw));
          return true;
        } catch (e) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        biometryAvailable,
        biometryEnabled,
        enableBiometry,
        tryBiometricUnlock,
        hasPin,
        setPin,
        verifyPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
