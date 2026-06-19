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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Proactive JWT Expiry Check
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = JSON.parse(window.atob(base64));
      if (jsonPayload.exp && Date.now() >= jsonPayload.exp * 1000) {
        logout();
        return;
      }
    } catch {
      logout();
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Proactive JWT Expiry Check
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = JSON.parse(window.atob(base64));
        if (jsonPayload.exp && Date.now() >= jsonPayload.exp * 1000) {
          Promise.resolve().then(() => {
            logout();
            setIsLoading(false);
          });
          return;
        }
      } catch {
        Promise.resolve().then(() => {
          logout();
          setIsLoading(false);
        });
        return;
      }

      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch((err: unknown) => {
          const error = err as { response?: { status?: number } };
          if (error?.response?.status === 401) {
            logout();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    checkAuth();
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
