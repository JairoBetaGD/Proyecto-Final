/**
 * Tipos compartidos para la vista de detalle de un comunicado.
 *
 * ISP: interfaces pequeñas y enfocadas; los consumidores importan solo lo que
 * necesitan (p. ej. AttachmentPreviewModal solo conoce DocumentDetail).
 */

/** Adjunto mostrado en la vista de detalle / vista previa. */
export interface DocumentDetail {
  name: string;
  type: string;
  size: string;
  icon: string;
  /** MIME type derivado del archivo original. */
  mimeType?: string;
  /** URL pública del archivo en Vercel Blob (Mongo solo registra este enlace). */
  url?: string;
}

/** Mapa de Google vinculado al comunicado (guardado aparte del texto). */
export interface MapDetail {
  label: string;
  /** URL pública de incrustación de Google Maps. */
  url: string;
}

/** Modelo de presentación de un comunicado en la vista de detalle. */
export interface CommunicationDetail {
  id: string;
  title: string;
  category: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Publicado' | 'Borrador' | 'Archivado' | 'Programado';
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    role?: string;
  };
  documents?: DocumentDetail[];
  /** Mapas de Google vinculados al comunicado (separados del texto). */
  maps?: MapDetail[];
}
