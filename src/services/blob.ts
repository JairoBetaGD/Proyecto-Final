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
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: `${API_BASE}/upload-client`,
        ...(file.type ? { contentType: file.type } : {}),
      });
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
