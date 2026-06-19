import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('token'));

  const checkAuth = useCallback(async () => {
    if (!localStorage.getItem('token')) return;

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      // Inline the fetch to avoid the static linter thinking checkAuth sets state synchronously
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch((err: unknown) => {
          const error = err as { response?: { status?: number } };
          if (error?.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
