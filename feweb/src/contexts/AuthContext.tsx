import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import api from '../lib/axios';

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Decode JWT payload (client-side only, không verify signature).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const json = new TextDecoder('utf-8').decode(bytes);

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Kiểm tra token còn hạn không (có buffer 30s).
 */
function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now() + 30000;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Khôi phục session từ localStorage khi mount */
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      if (isTokenValid(storedToken)) {
        setAccessToken(storedToken);

        setUser(JSON.parse(storedUser));
      } else {
        // Access token hết hạn → thử refresh (refresh token đã nằm trong HttpOnly cookie)
        api.post('/users/refresh', {})
          .then(({ data }) => {
            localStorage.setItem('accessToken', data.accessToken);

            setAccessToken(data.accessToken);

            setUser(JSON.parse(storedUser));
          })
          .catch(() => {
            localStorage.removeItem('accessToken');

            localStorage.removeItem('user');
          });
      }
    }

    setIsLoading(false);
  }, []);

  /** Đăng nhập */
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    const payload = decodeJwtPayload(data.accessToken);
    const authUser: AuthUser = {
      userId: payload?.userId as number,
      roleId: payload?.roleId as number,
      email: email,
      fullName: (payload?.fullName as string) || email,
    };

    localStorage.setItem('accessToken', data.accessToken);

    localStorage.setItem('user', JSON.stringify(authUser));

    setAccessToken(data.accessToken);

    setUser(authUser);
  }, []);

  /** Đăng xuất */
  const logout = useCallback(async () => {
    try {
      await api.post('/users/logout', {});
    } catch { } finally {
      localStorage.removeItem('accessToken');

      localStorage.removeItem('user');

      setAccessToken(null);

      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
