import { createContext } from 'react';
import type { AuthUser } from '../services/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  /** true mientras se valida el token guardado al cargar la app. */
  initializing: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  signup: (username: string, password: string, department: string) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
