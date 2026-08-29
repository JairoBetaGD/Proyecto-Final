/**
 * Emisión y verificación de tokens JWT.
 *
 * SRP: única responsabilidad — firmar y verificar tokens de sesión.
 * DIP: `services/authService` y `middlewares/auth` dependen de esta
 * abstracción en lugar de usar `jsonwebtoken` directamente, y el secreto
 * tiene una única fuente de verdad (antes estaba duplicado en dos módulos).
 */
import jwt from 'jsonwebtoken';
import '../config/env.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'proyecto-final-secret';
const TOKEN_EXPIRES_IN = process.env.AUTH_TOKEN_EXPIRES_IN || '7d';

/** Firma un token JWT con la identidad de la cuenta. */
export function signToken(payload) {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * Verifica un token JWT y devuelve el payload decodificado.
 * Lanza si el token es inválido o está expirado.
 */
export function verifyToken(token) {
  return jwt.verify(token, AUTH_SECRET);
}
