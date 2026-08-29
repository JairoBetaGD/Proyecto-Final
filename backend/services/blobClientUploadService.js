/**
 * Autorización de subidas directas (client uploads) a Vercel Blob.
 *
 * SRP: únicamente decide SI y CON QUÉ RESTRICCIONES el navegador puede subir
 * un archivo. El binario nunca pasa por esta función: tras recibir el token
 * efímero, el navegador envía el archivo directamente al almacenamiento.
 *
 * ¿Por qué existe? Las funciones serverless de Vercel limitan el cuerpo de la
 * petición a 4,5 MB, por lo que la subida anterior (multipart → put()) fallaba
 * en producción para archivos grandes aunque funcionara en local. Con client
 * uploads el backend solo firma una autorización pequeña y el archivo viaja
 * directo al Blob.
 */
import { handleUpload } from '@vercel/blob/client';
import '../config/env.js';

/** Límite duro del token: por encima del límite de la app (15 MB por archivo). */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/**
 * POST /api/upload-client
 *
 * El SDK del navegador envía dos tipos de peticiones a esta ruta:
 *  - `blob.generate-client-token`: se responde con un token efímero que
 *    autoriza la subida con las restricciones de `onBeforeGenerateToken`.
 *  - `blob.upload-completed`: callback que Vercel Blob invoca al terminar la
 *    subida; se responde con «ok» (no necesitamos persistir nada aquí).
 */
export async function handleClientUpload(req, res) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        message:
          'El servidor no tiene configurado BLOB_READ_WRITE_TOKEN. Configura el token de Vercel Blob en las variables de entorno.',
      });
    }

    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        // Rechazar en el token archivos que superen el límite duro, aunque el
        // navegador ya limita a 15 MB antes de intentar la subida.
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        // Sufijo aleatorio: evita colisiones entre archivos con el mismo
        // nombre (equivalente al prefijo único de la subida server-side).
        addRandomSuffix: true,
      }),
    });

    res.status(200).json(jsonResponse);
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo autorizar la subida del archivo a Vercel Blob',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}