'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import type { User, Role } from '@/lib/drizzle/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roles: Role[];
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger la session au montage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          // Mapper le user better-auth vers notre type User
          const userData = {
            id: session.data.user.id,
            email: session.data.user.email,
            name: session.data.user.name || session.data.user.email,
            emailVerified: session.data.user.emailVerified || false,
            image: session.data.user.image,
            createdAt: new Date(), // Sera remplacé par la vraie valeur côté serveur
            updatedAt: new Date(),
          };
          setUser(userData);

          // Charger les rôles de l'utilisateur
          await loadUserRoles(session.data.user.id);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Charger les rôles depuis l'API
  const loadUserRoles = async (userId: string) => {
    try {
      const response = await fetch('/api/users/me/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Failed to load user roles:', error);
      setRoles([]);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { error: result.error.message || 'Login failed' };
      }

      // Rafraîchir l'utilisateur
      await refreshUser();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        return { error: result.error.message || 'Registration failed' };
      }

      // Rafraîchir l'utilisateur
      await refreshUser();
      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        const userData = {
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email,
          emailVerified: session.data.user.emailVerified || false,
          image: session.data.user.image,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(userData);

        // Recharger les rôles
        await loadUserRoles(session.data.user.id);
      } else {
        setUser(null);
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Déterminer les rôles
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
