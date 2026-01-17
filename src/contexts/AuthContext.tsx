"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, isAdminRole } from '@/services/auth.service';
import { tokenManager } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role?: 'user' | 'admin' | 'superadmin' | 'super_admin';
    mobile?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    fullName?: string;
    email?: string;
    mobile?: string;
    password?: string;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenManager.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authService.getProfile();
          setUser(response.data);
        } catch (error) {
          // Token is invalid, remove it
          tokenManager.removeToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const { token: newToken, user: newUser } = response.data;
      
      tokenManager.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
      
      // Redirect based on role - admin and super_admin go to dashboard
      if (isAdminRole(newUser.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    role?: 'user' | 'admin' | 'superadmin' | 'super_admin';
    mobile?: string;
  }) => {
    try {
      const response = await authService.register(data);
      const { token: newToken, user: newUser } = response.data;
      
      tokenManager.setToken(newToken);
      setToken(newToken);
      setUser(newUser);
      
      // Redirect based on role - admin and super_admin go to admin panel
      if (isAdminRole(newUser.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await authService.logout();
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state
      tokenManager.removeToken();
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  const updateProfile = async (data: {
    fullName?: string;
    email?: string;
    mobile?: string;
    password?: string;
  }) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
    } catch (error: any) {
      // If profile fetch fails, user might be logged out
      logout();
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};















