/**
 * Servicio de autenticación: registro y login de cuentas.
 *
 * SRP: el manejo de cuentas vive aquí; la emisión/verificación de tokens vive
 * en `services/tokenService.js` y `auth.routes.js` solo traduce HTTP a estas
 * funciones.
 *
 * Cuenta ADMIN hardcodeada con TODOS los privilegios:
 *   - Hay dos formas de permitir login del admin:
 *     1) Valor predeterminado en el código: `admin` / `admin123`.
 *     2) Sobreescribir con las variables de entorno ADMIN_USERNAME y
 *        ADMIN_PASSWORD.
 */
import bcrypt from 'bcryptjs';
import { signToken } from './tokenService.js';
import { HttpError } from '../utils/httpError.js';
import '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { DEPARTMENTS } from '../config/departments.js';

/** Usuario y contraseña de la cuenta de administrador hardcodeada. */
export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Secreto y expiración del token centralizados en services/tokenService.js (DIP).

/** Error de negocio de autenticación: extiende HttpError para el manejador central. */
export class AuthError extends HttpError {
  constructor(status, message) {
    super(status, message);
    this.status = status;
  }
}

/** Convierte un documento de usuario a la forma pública (sin password). */
const toPublicUser = (doc) => ({
  id: String(doc._id),
  username: doc.username,
  role: doc.role,
  department: doc.department,
});


/**
 * Registra una cuenta nueva.
 * { username, password, department } -> { token, user }
 */
export async function register({ username, password, department = '' }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const cleanDepartment = String(department || '').trim();

  if (cleanUsername.length < 3) {
    throw new AuthError(400, 'El nombre de usuario debe tener al menos 3 caracteres.');
  }
  if (cleanPassword.length < 4) {
    throw new AuthError(400, 'La contraseña debe tener al menos 4 caracteres.');
  }
  if (!DEPARTMENTS.includes(cleanDepartment)) {
    throw new AuthError(
      400,
      `Departamento inválido. Debe ser uno de: ${DEPARTMENTS.join(', ')}.`
    );
  }
  if (cleanUsername === ADMIN_USERNAME) {
    throw new AuthError(400, 'Ese nombre de usuario no está disponible.');
  }

  const existing = await userRepository.findByUsername(cleanUsername);
  if (existing) {
    throw new AuthError(409, 'Ese nombre de usuario ya está registrado.');
  }

  const hashedPassword = await bcrypt.hash(cleanPassword, 10);
  const user = await userRepository.create({
    username: cleanUsername,
    password: hashedPassword,
    department: cleanDepartment,
    role: 'user',
  });

  const token = signToken({
    sub: String(user._id),
    username: user.username,
    role: user.role,
    department: user.department,
  });

  return { token, user: toPublicUser(user) };
}

/**
 * Inicia sesión.
 * { username, password } -> { token, user }
 *
 * La cuenta admin hardcodeada se valida sin tocar la base de datos.
 */
export async function login({ username, password }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanUsername || !cleanPassword) {
    throw new AuthError(400, 'Usuario y contraseña son obligatorios.');
  }

  // Cuenta administrador hardcodeada (todos los privilegios).
  if (cleanUsername === ADMIN_USERNAME) {
    if (cleanPassword !== ADMIN_PASSWORD) {
      throw new AuthError(401, 'Credenciales inválidas.');
    }

    const token = signToken({
      sub: 'admin',
      username: ADMIN_USERNAME,
      role: 'admin',
      department: '',
    });

    return {
      token,
      user: { id: 'admin', username: ADMIN_USERNAME, role: 'admin', department: null },
    };
  }

  const user = await userRepository.findByUsername(cleanUsername);
  if (!user) {
    throw new AuthError(401, 'Credenciales inválidas.');
  }

  const passwordMatches = await bcrypt.compare(cleanPassword, user.password);
  if (!passwordMatches) {
    throw new AuthError(401, 'Credenciales inválidas.');
  }

  const token = signToken({
    sub: String(user._id),
    username: user.username,
    role: user.role,
    department: user.department,
  });

  return { token, user: toPublicUser(user) };
}