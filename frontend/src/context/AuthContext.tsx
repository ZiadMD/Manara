import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { request } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (targetRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Instant hydration from localStorage - 0ms delay
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('manara_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('manara_token');
    } catch {
      return null;
    }
  });

  // Never block initial page load
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Background verification of token (non-blocking)
  useEffect(() => {
    let isMounted = true;

    async function verifyUser() {
      const activeToken = localStorage.getItem('manara_token');
      if (!activeToken) return;

      try {
        const profile = await request<User>('/auth/me', {}, 4000);
        if (isMounted) {
          setUser(profile);
          localStorage.setItem('manara_user', JSON.stringify(profile));
        }
      } catch (err: any) {
        console.warn('Session check failed or expired:', err?.message);
        if (isMounted && err?.status === 401) {
          logout();
        }
      }
    }

    verifyUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const data = await request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, 5000);

      localStorage.setItem('manara_token', data.access_token);
      localStorage.setItem('manara_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: Role) => {
    const emailMap: Record<Role, string> = {
      student: 'student@manara.school',
      counselor: 'counselor@manara.school',
      admin: 'admin@manara.school',
    };
    await login(emailMap[targetRole]);
  };

  const logout = () => {
    localStorage.removeItem('manara_token');
    localStorage.removeItem('manara_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
