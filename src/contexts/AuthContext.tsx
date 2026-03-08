
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore, useCurrentUser, useIsAuthenticated } from '@sdkwork/react-mobile-auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const { login: authLogin, register: authRegister, logout: authLogout } = useAuthStore();

  useEffect(() => {
    // Simulate initialization
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      return await authLogin(username, password);
    } catch (error) {
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      return await authRegister(username, password, password);
    } catch (error) {
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await authLogout();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
