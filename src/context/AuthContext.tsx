'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '@/types';

  interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    login: (name: string, role: Role) => void;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    // Mocking Sullivan as Super Admin by default for this session
    const [user, setUser] = useState<User | null>({
      id: 'sullivan-id',
      name: 'Sullivan',
      role: 'super-admin',
      status: 'active',
      avatar: 'https://github.com/shadcn.png'
    });
  
    const isSuperAdmin = user?.role === 'super-admin';
    const isAdmin = isSuperAdmin || user?.role === 'admin';
  
    const login = (name: string, role: Role) => {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        name,
        role,
        status: 'active',
        avatar: 'https://github.com/shadcn.png'
      });
    };
  
    const logout = () => {
      setUser(null);
    };
  
    return (
      <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, login, logout }}>
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
