/**
 * Rutas de autenticación.
 *
 * SRP: solo traducen HTTP a las funciones del servicio de autenticación.
 *
 * POST /api/auth/register   -> crea cuenta (usuario, contraseña, departamento)
 * POST /api/auth/login      -> inicia sesión y devuelve token
 * GET  /api/auth/me         -> devuelve la cuenta actual (requiere token)
 */
import { Router } from 'express';
import { register, login, AuthError } from '../services/authService.js';
import { userRepository } from '../repositories/userRepository.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

/** Envuelve un handler async y traduce errores de negocio a respuestas HTTP. */
const withError = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 500;
    res.status(status).json({
      message: error && error.message ? error.message : 'Error en la autenticación',
    });
  }
};

const toPublicUser = (doc) => ({
  id: String(doc._id),
  username: doc.username,
  role: doc.role,
  department: doc.department,
});

router.post(
  '/register',
  withError(async (req, res) => {
    const { username, password, department } = req.body || {};
    const { token, user } = await register({ username, password, department });
    res.status(201).json({ token, user });
  })
);

router.post(
  '/login',
  withError(async (req, res) => {
    const { username, password } = req.body || {};
    const { token, user } = await login({ username, password });
    res.json({ token, user });
  })
);

router.get('/me', requireAuth, async (req, res) => {
  try {
    // La cuenta admin es hardcodeada (no existe en la BD).
    if (req.auth.id === 'admin') {
      return res.json({
        user: { id: 'admin', username: req.auth.username, role: 'admin', department: null },
      });
    }

    const user = await userRepository.findByUsername(req.auth.username);
    if (!user) {
      return res.status(401).json({ message: 'La cuenta ya no existe.' });
    }

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la cuenta actual', error: error.message });
  }
});

export default router;