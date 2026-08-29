/**
 * Rutas de subida de archivos.
 *
 * SRP: solo mapea HTTP al servicio de almacenamiento.
 */
import { Router } from 'express';
import { handleFilesUpload } from '../services/blobStorageService.js';
import { handleClientUpload } from '../services/blobClientUploadService.js';

const router = Router();

router.post('/upload', handleFilesUpload);
router.post('/upload-client', handleClientUpload);

export default router;
