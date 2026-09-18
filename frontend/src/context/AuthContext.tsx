import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { AuthResponse } from '../types/auth/AuthResponse';
import type { AuthUser } from '../types/auth/AuthUser';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');

    try {
      if (rawUser) {
        setUser(JSON.parse(rawUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (response: AuthResponse) => {
    const authUser: AuthUser = {
      email: response.email,
      role: response.role,
      token: response.token,
    };

    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}