'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, User, LoginCredentials, RegisterData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser();
          if (response.data) {
            setUser(response.data);
          } else {
            // Token might be invalid, try to refresh
            const refreshResponse = await apiClient.refreshToken();
            if (refreshResponse.data) {
              const userResponse = await apiClient.getCurrentUser();
              if (userResponse.data) {
                setUser(userResponse.data);
              } else {
                apiClient.clearTokens();
              }
            } else {
              apiClient.clearTokens();
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          apiClient.clearTokens();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.data) {
        // Store tokens
        apiClient.setTokens(response.data.access_token, response.data.refresh_token);
        
        // Get user data
        const userResponse = await apiClient.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
          return { success: true };
        }
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(userData);
      
      if (response.data) {
        // Store tokens
        apiClient.setTokens(response.data.access_token, response.data.refresh_token);
        
        // Get user data
        const userResponse = await apiClient.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
          return { success: true };
        } else {
          console.error('Failed to get user data after registration:', userResponse.error);
          return { success: false, error: userResponse.error || 'Failed to get user data' };
        }
      }
      
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.clearTokens();
    }
  };

  const refreshUser = async () => {
    if (apiClient.isAuthenticated()) {
      try {
        const response = await apiClient.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
