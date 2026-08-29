const TOKEN_KEY = 'auth_token';

/** Guarda el token JWT de la sesión en el navegador. */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);