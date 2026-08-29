/**
 * Rutas de salud de la API.
 *
 * SRP: solo expone el estado del servicio y de la conexión a la BD.
 */
import { Router } from 'express';
import { isDatabaseConnected, getMongooseReadyState } from '../db/connection.js';
import '../config/env.js';

const router = Router();

router.get('/health', (req, res) => {
  const isDbConnected = isDatabaseConnected();
  // Diagnóstico de subidas: solo se informa SI está configurado el token,
  // nunca su valor. Un booleano en false explica por qué fallan los adjuntos.
  const isBlobTokenConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  res.json({
    status: isDbConnected ? 'ok' : 'error',
    message: isDbConnected
      ? 'API y base de datos en línea'
      : 'Backend disponible, pero la base de datos no está conectada',
    database: {
      connected: isDbConnected,
      state: getMongooseReadyState(),
    },
    blobStorage: {
      tokenConfigured: isBlobTokenConfigured,
    },
  });
});

export default router;
