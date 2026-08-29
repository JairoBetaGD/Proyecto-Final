/**
 * Detección del tipo de vista previa de un adjunto.
 *
 * SRP: lógica pura de clasificación, sin dependencias de React ni DOM.
 *
 * OCP: agregar una nueva familia de tipos solo requiere una entrada en la
 * tabla de detección.
 */

export type AttachmentPreviewKind = 'image' | 'pdf' | 'text' | 'video' | 'other';

export interface PreviewableDocument {
  type?: string;
  mimeType?: string;
}

// Tabla de detección por extensión (una entrada por familia de tipos).
const PREVIEW_KIND_BY_EXT: Array<[AttachmentPreviewKind, RegExp]> = [
  ['image', /^(PNG|JPG|JPEG|GIF|WEBP|SVG|BMP|HEIC)$/],
  ['pdf', /^PDF$/],
  ['video', /^(VIDEO|MP4|WEBM|MOV|AVI|MKV|MPEG|MPG|WMV|FLV|OGV)$/],
  ['text', /^(TXT|MD|CSV|JSON|LOG|HTML|XML|RTF)$/],
];

/** Determina cómo previsualizar un adjunto según su tipo y MIME type. */
export const getAttachmentPreviewKind = (
  doc: PreviewableDocument
): AttachmentPreviewKind => {
  const type = (doc.type || '').toUpperCase();
  const mime = (doc.mimeType || '').toLowerCase();

  if (type === 'IMAGE' || mime.startsWith('image/')) {
    return 'image';
  }
  if (type === 'PDF' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (mime.startsWith('video/')) {
    return 'video';
  }
  if (mime.startsWith('text/') || mime === 'application/json') {
    return 'text';
  }

  const byExt = PREVIEW_KIND_BY_EXT.find(([, pattern]) => pattern.test(type));
  return byExt ? byExt[0] : 'other';
};
