/**
 * Servicio de almacenamiento de archivos en Vercel Blob.
 *
 * SRP: encapsula el parsing multipart (busboy) y la subida a Vercel Blob.
 * No conoce rutas ni Express más allá del par (req, res) que recibe.
 */
import { put } from '@vercel/blob';
import busboy from 'busboy';
import '../config/env.js';

/**
 * Recibe un archivo (multipart/form-data), lo sube a Vercel Blob Storage y
 * responde con la URL pública del archivo subido. Los archivos se guardan en
 * la base de datos como URL (no como binario), lo que permite videos grandes.
 * Requiere la variable de entorno BLOB_READ_WRITE_TOKEN (provista por Vercel).
 */
export async function handleFilesUpload(req, res) {
  try {
    // Validar temprano que el almacenamiento esté configurado para dar un
    // error claro en lugar de fallar al momento de hacer put().
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        message:
          'El servidor no tiene configurado BLOB_READ_WRITE_TOKEN. Configura el token de Vercel Blob en las variables de entorno.',
      });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ message: 'Se requiere multipart/form-data.' });
    }

    // Parse multipart con busboy (ligero, sin dependencias pesadas).
    // En busboy >= 1.x el default export es una función fábrica (no un constructor).
    const bb = busboy({ headers: req.headers });
    const promises = [];
    let fieldName = '';
    let fileName = '';
    let mimeType = '';

    bb.on('file', (name, stream, info) => {
      fileName = info?.filename || '';
      mimeType = info?.mimeType || 'application/octet-stream';
      const buffers = [];
      stream.on('data', (chunk) => buffers.push(chunk));
      stream.on('end', () => {
        const fileBuffer = Buffer.concat(buffers);
        fieldName = name;

        // Sanitizar nombre de archivo
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
        const blobName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;

        promises.push(
          put(blobName, fileBuffer, {
            access: 'public',
            contentType: mimeType,
          }).then((blob) => ({ blob, fileName, mimeType, type: name }))
        );
      });
    });

    bb.on('finish', async () => {
      try {
        const results = await Promise.all(promises);
        res.json({ files: results.map((r) => ({
          url: r.blob.url,
          name: r.fileName,
          mimeType: r.mimeType,
          type: r.type,
        })) });
      } catch (error) {
        res.status(500).json({ message: 'Error al subir archivo(s)', error: error.message });
      }
    });

    bb.on('error', (error) => {
      res.status(500).json({ message: 'Error procesando el formulario', error: error.message });
    });

    req.pipe(bb);
  } catch (error) {
    res.status(500).json({ message: 'Error al subir archivo', error: error.message });
  }
}
