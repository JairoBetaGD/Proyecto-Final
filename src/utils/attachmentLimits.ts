/**
 * Límites de tamaño para los comunicados.
 *
 * El contenido HTML se valida contra estos límites antes de guardarlo en
 * MongoDB. Los archivos adjuntos se suben a Vercel Blob y Mongo solo registra
 * su URL, por lo que no cuentan contra el límite del documento BSON (~16 MB).
 */

export const MAX_FILE_MB = 15;
export const MAX_TOTAL_MB = 15;

const MB = 1024 * 1024;

export const MAX_FILE_BYTES = MAX_FILE_MB * MB;
export const MAX_TOTAL_BYTES = MAX_TOTAL_MB * MB;

/**
 * Aproximación de bytes binarios correspondientes a una cadena base64
 * (el base64 infla ~4/3 el original).
 */
export const base64RawBytes = (b64Length: number): number =>
  Math.floor(b64Length * 0.75);

/** Da formato legible a un número de bytes (B/KB/MB). */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};