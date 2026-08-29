/**
 * Middlewares de autenticación y autorización.
 *
 * SRP: únicamente validan el token JWT (Authorization: Bearer <token>) y
 * dejan la identidad resuelta en `req.auth` para el resto de los handlers.
 */
import { verifyToken } from '../services/tokenService.js';
import '../config/env.js';

// Secreto JWT centralizado en services/tokenService.js (fuente única, DIP).

/**
 * Exige un token JWT válido.
 * En `req.auth` se deja: { id, username, role, department }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Se requiere iniciar sesión para realizar esta acción.' });
  }

  try {
    const payload = verifyToken(token);
    req.auth = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      department: payload.department,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'La sesión es inválida o ha expirado.' });
  }
}

/**
 * Exige que la cuenta autenticada tenga rol `admin`.
 * Debe ejecutarse DESPUÉS de `requireAuth`.
 */
export function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede realizar esta acción.' });
  }
  return next();
}