import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { STORE_STORAGE, type User } from '../types/api';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORE_STORAGE.user);
    const token = localStorage.getItem(STORE_STORAGE.token);
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORE_STORAGE.user);
        localStorage.removeItem(STORE_STORAGE.token);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      const { token, user } = response;
localStorage.setItem(STORE_STORAGE.token, token);
      localStorage.setItem(STORE_STORAGE.user, JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao fazer login' };
    }
  };

  const register = async (data: any) => {
    try {
      await api.post('/auth/register', data);
      // Opcional: fazer login automático após registro
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao registrar' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORE_STORAGE.token);
    localStorage.removeItem(STORE_STORAGE.user);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
