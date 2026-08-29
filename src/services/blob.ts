import { upload } from '@vercel/blob/client';

export interface BlobUploadResultFile {
  url: string;
  name: string;
  mimeType: string;
  type: string;
}

export interface BlobUploadResult {
  files: BlobUploadResultFile[];
}

// Origen de la API (el backend autoriza la subida, no recibe el binario).
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
export const UPLOAD_CLIENT_URL = `${API_BASE}/upload-client`;

/**
 * Verifica que el backend pueda emitir un token de subida ANTES de llamar al
 * SDK. El SDK (retrieveClientToken) descarta el cuerpo del error del backend
 * y lanza solo «Failed to retrieve the client token», un mensaje inútil para
 * el usuario. Aquí leemos el JSON de error del backend (p. ej. «BLOB_READ_WRITE_TOKEN
 * no configurado», «Error de conexión a la base de datos») y lo propagamos
 * como un mensaje accionable.
 */
const preflightToken = async (pathname: string): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(UPLOAD_CLIENT_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: { pathname, clientPayload: null, multipart: true },
      }),
    });
  } catch {
    throw new Error(
      `No se pudo contactar al servidor de subida (${UPLOAD_CLIENT_URL}). ` +
        'Verifica que el backend esté en ejecución y que la URL base de la API (VITE_API_URL) sea la correcta.'
    );
  }

  if (!response.ok) {
    let serverMessage = '';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') {
        serverMessage = data.message;
      }
    } catch {
      // Cuerpo no legible (HTML, vacío…): se informa el status HTTP.
    }
    throw new Error(
      serverMessage ||
        `El servidor de subida respondió HTTP ${response.status}. El archivo no fue adjuntado.`
    );
  }
};

/** Traduce un error del SDK (pierde el detalle) a un mensaje utilizable. */
const toUploadErrorMessage = (file: File, error: unknown): Error => {
  const raw = error instanceof Error ? error.message : String(error);
  if (/Failed to retrieve the client token/i.test(raw)) {
    return new Error(
      `El backend no autorizó la subida de "${file.name}". Verifica la configuración del almacenamiento (BLOB_READ_WRITE_TOKEN) y el estado del servidor.`
    );
  }
  return new Error(raw || `Error desconocido al subir "${file.name}".`);
};

/**
 * Sube uno o varios archivos DIRECTAMENTE desde el navegador a Vercel Blob
 * (client uploads). El backend solo firma una autorización efímera vía
 * POST {API_BASE}/upload-client; el archivo viaja del navegador al
 * almacenamiento sin pasar por la función serverless (limitada a 4,5 MB de
 * body, motivo por el que la subida multipart anterior fallaba en producción).
 */
export const uploadFiles = async (files: File[]): Promise<BlobUploadResult> => {
  const uploaded = await Promise.all(
    files.map(async (file) => {
      // Falla rápido y con mensaje real antes de que el SDK lo enmascare.
      await preflightToken(file.name);

      let blob: Awaited<ReturnType<typeof upload>>;
      try {
        blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: UPLOAD_CLIENT_URL,
          ...(file.type ? { contentType: file.type } : {}),
        });
      } catch (error) {
        throw toUploadErrorMessage(file, error);
      }
      return {
        url: blob.url,
        name: file.name,
        mimeType: blob.contentType || file.type || 'application/octet-stream',
        type: 'file',
      };
    })
  );
  return { files: uploaded };
};

export default uploadFiles;
