/**
 * Rutas de salud de la API.
 *
 * SRP: solo expone el estado del servicio y de la conexión a la BD.
 */
import { Router } from 'express';
import { isDatabaseConnected, getMongooseReadyState } from '../db/connection.js';

const router = Router();

router.get('/health', (req, res) => {
  const isDbConnected = isDatabaseConnected();

  res.json({
    status: isDbConnected ? 'ok' : 'error',
    message: isDbConnected
      ? 'API y base de datos en línea'
      : 'Backend disponible, pero la base de datos no está conectada',
    database: {
      connected: isDbConnected,
      state: getMongooseReadyState(),
    },
  });
});

export default router;
