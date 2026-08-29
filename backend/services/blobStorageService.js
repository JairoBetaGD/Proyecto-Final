/**
 * Servicio de almacenamiento de archivos en Vercel Blob.
 *
 * SRP: encapsula el parsing multipart (busboy) y la subida a Vercel Blob,
 * devolviendo los metadatos de los archivos subidos. No conoce Express: la
 * respuesta HTTP la construye la ruta (`routes/upload.routes.js`).
 *
 * DIP: la ruta depende de esta abstracción y no de busboy ni de @vercel/blob.
 * Requiere la variable de entorno BLOB_READ_WRITE_TOKEN (provista por Vercel).
 */
import { put } from '@vercel/blob';
import busboy from 'busboy';
import '../config/env.js';
import { HttpError } from '../utils/httpError.js';

/** Sanitiza el nombre del archivo y genera un nombre único para el blob. */
const buildBlobName = (fileName) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  return `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;
};

/**
 * Parsea el cuerpo multipart de `req`, sube cada archivo a Vercel Blob y
 * resuelve con sus metadatos. Rechaza con `HttpError` ante formularios
 * inválidos o fallos de subida.
 *
 * @param {import('express').Request} req
 * @returns {Promise<Array<{ url: string, name: string, mimeType: string, type: string }>>}
 */
export function uploadMultipartFiles(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      reject(new HttpError(400, 'Se requiere multipart/form-data.'));
      return;
    }

    // En busboy >= 1.x el default export es una función fábrica (no un constructor).
    const bb = busboy({ headers: req.headers });
    const promises = [];
    // Evita resolver/rechazar dos veces si busboy emite «error» tras «finish».
    let settled = false;
    const settle = (callback, value) => {
      if (!settled) {
        settled = true;
        callback(value);
      }
    };

    bb.on('file', (name, stream, info) => {
      const fileName = info?.filename || '';
      const mimeType = info?.mimeType || 'application/octet-stream';
      const buffers = [];
      stream.on('data', (chunk) => buffers.push(chunk));
      stream.on('end', () => {
        const fileBuffer = Buffer.concat(buffers);
        promises.push(
          put(buildBlobName(fileName), fileBuffer, {
            access: 'public',
            contentType: mimeType,
          })
            .then((blob) => ({ url: blob.url, name: fileName, mimeType, type: name }))
            .catch((uploadError) => {
              throw new HttpError(
                500,
                `Error al subir archivo(s): ${uploadError?.message ?? uploadError}`
              );
            })
        );
      });
    });

    bb.on('error', (error) => {
      settle(
        reject,
        new HttpError(500, `Error procesando el formulario: ${error?.message ?? error}`)
      );
    });

    bb.on('finish', () => {
      Promise.all(promises)
        .then((files) => settle(resolve, files))
        .catch((error) => settle(reject, error));
    });

    req.pipe(bb);
  });
}

