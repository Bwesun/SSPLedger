import React, { useEffect, useState, createContext, useContext } from 'react';
import { apiFetch } from '../utils/api';

// Define user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ssp' | 'admin';
  phone?: string;
  gender?: string;
  state?: string;
  lga?: string;
  community?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiFetch<{ message: string; token: string; user: User }>(`/auth/login`, {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      await apiFetch<{ message: string }>(`/auth/register`, { method: 'POST', body: userData, auth: false });
      // Auto-login after registration
      const loginOk = await login(userData.email || '', userData.password);
      return loginOk;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      await apiFetch<{ message: string }>(`/ssp/profile`, { method: 'PUT', body: userData });
      if (user) {
        const updated = { ...user, ...userData } as User;
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
