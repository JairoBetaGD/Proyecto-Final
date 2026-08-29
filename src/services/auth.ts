/**
 * Servicio de autenticación (frontend).
 *
 * SRP: expone solo las operaciones que el frontend necesita: login, registro y
 * consulta de la cuenta actual. La gestión del token vive en `services/token`.
 */
import api from './api';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  /** Departamento de la cuenta (null en el admin). */
  department: string | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const loginRequest = (
  username: string,
  password: string
): Promise<AuthResponse> =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const registerRequest = (
  username: string,
  password: string,
  department: string
): Promise<AuthResponse> =>
  api
    .post<AuthResponse>('/auth/register', { username, password, department })
    .then((r) => r.data);

export const getCurrentUser = (): Promise<AuthUser> =>
  api.get<{ user: AuthUser }>('/auth/me').then((r) => r.data.user);