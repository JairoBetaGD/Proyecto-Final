/**
 * Rutas de subida de archivos.
 *
 * SRP: solo mapea HTTP a los servicios de almacenamiento (valida y responde;
 * no parsea multipart ni sube nada por sí misma).
 *
 * OCP: los errores de negocio (HttpError) se traducen a JSON mediante
 * `asyncHandler` sin duplicar try/catch.
 */
import { Router } from 'express';
import { uploadMultipartFiles } from '../services/blobStorageService.js';
import { authorizeClientUpload } from '../services/blobClientUploadService.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

/**
 * POST /api/upload
 *
 * Sube archivo(s) (multipart/form-data) a Vercel Blob y responde con sus
 * URLs públicas. Requiere BLOB_READ_WRITE_TOKEN.
 */
router.post(
  '/upload',
  asyncHandler(async (req, res) => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new HttpError(
        500,
        'El servidor no tiene configurado BLOB_READ_WRITE_TOKEN. Configura el token de Vercel Blob en las variables de entorno.'
      );
    }
    const files = await uploadMultipartFiles(req);
    res.json({ files });
  }, { message: 'Error al subir archivo' })
);

/**
 * POST /api/upload-client
 *
 * Autoriza subidas directas del navegador a Vercel Blob (client uploads).
 */
router.post(
  '/upload-client',
  asyncHandler(async (req, res) => {
    const jsonResponse = await authorizeClientUpload(req);
    res.status(200).json(jsonResponse);
  }, { status: 400, message: 'No se pudo autorizar la subida del archivo a Vercel Blob' })
);

export default router;

