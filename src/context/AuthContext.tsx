/**
 * Contexto de autenticación global.
 *
 * SRP: gestiona la sesión actual (usuario + token) de forma centralizada y la
 * expone a cualquier componente con `useAuth()`.
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  getCurrentUser,
  loginRequest,
  registerRequest,
  type AuthUser,
} from '../services/auth';
import { clearToken, getToken, setToken } from '../services/token';
import { AuthContext } from './auth.context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = getToken();
    let mounted = true;

    Promise.resolve()
      .then(() => {
        if (!token) {
          return;
        }
        return getCurrentUser();
      })
      .then((user) => {
        if (mounted && user) setUser(user);
      })
      .catch(() => {
        // Token inválido o expirado: se limpia y se pide iniciar sesión.
        if (mounted) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const { token, user: loggedUser } = await loginRequest(username, password);
    setToken(token);
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (
    username: string,
    password: string,
    department: string
  ): Promise<AuthUser> => {
    const { token, user: newUser } = await registerRequest(username, password, department);
    setToken(token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

