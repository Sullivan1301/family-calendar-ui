'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import type { User, Role } from '@/lib/drizzle/schema';

interface FamilyInfo {
  id: string;
  name: string;
  role: Role | null;
  memberStatus: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roles: Role[];
  families: FamilyInfo[];
  activeFamily: FamilyInfo | null;
  setActiveFamily: (family: FamilyInfo) => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [activeFamily, setActiveFamilyState] = useState<FamilyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setFamilies(data.families || []);

        const allRoles = (data.families || []).map((f: FamilyInfo) => f.role).filter(Boolean) as Role[];
        setRoles([...new Set(allRoles)]);

        const savedFamilyId = localStorage.getItem('activeFamilyId');
        const active = data.families?.find((f: FamilyInfo) => f.id === savedFamilyId) || data.families?.[0] || null;
        setActiveFamilyState(active);
      }
    } catch {
      setRoles([]);
      setFamilies([]);
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const userData: User = {
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          emailVerified: session.data.user.emailVerified || false,
          image: session.data.user.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);
        await fetchProfile(session.data.user.id);
      }
    } catch {
      // Session load failed, user stays null
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const setActiveFamily = (family: FamilyInfo) => {
    setActiveFamilyState(family);
    localStorage.setItem('activeFamilyId', family.id);
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        return { error: result.error.message || 'Login failed' };
      }
      await refreshUser();
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({ email, password, name });
      if (result.error) {
        return { error: result.error.message || 'Registration failed' };
      }
      await refreshUser();
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setRoles([]);
      setFamilies([]);
      setActiveFamilyState(null);
    } catch {
      // Logout error, state is already cleared
    }
  };

  const refreshUser = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const userData: User = {
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          emailVerified: session.data.user.emailVerified || false,
          image: session.data.user.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);
        await fetchProfile(session.data.user.id);
      } else {
        setUser(null);
        setRoles([]);
        setFamilies([]);
        setActiveFamilyState(null);
      }
    } catch {
      // Refresh failed
    }
  };

  const isAuthenticated = !!user;
  const isSuperAdmin = roles.includes('super-admin');
  const isAdmin = roles.includes('admin') || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        roles,
        families,
        activeFamily,
        setActiveFamily,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
