'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { username: string; role: string } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authVersion: number;
  logout: () => Promise<void>;
  login: (token: string, user: { username: string; role: string }) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  authVersion: 0,
  logout: async () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authVersion, setAuthVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('aura_admin_token') : null;
    setToken(storedToken);

    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setUser(data?.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const clearAllAuth = () => {
    setUser(null);
    setToken(null);
    setAuthVersion(v => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_admin_token');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors during logout
    }
    clearAllAuth();
    router.push('/login');
  };

  const login = (newToken: string, newUser: { username: string; role: string }) => {
    setToken(newToken);
    setUser(newUser);
    setAuthVersion(v => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_admin_token', newToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, authVersion, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useApiAuth() {
  const { token } = useAuth();
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include' as const,
  };
}
