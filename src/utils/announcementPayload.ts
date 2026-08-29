/**
 * Constructor del payload de API a partir del estado del formulario.
 *
 * SRP: la transformación formulario → contrato HTTP vive aquí, separada de la
 * gestión de estado del hook (`useAnnouncementForm`) y de la UI.
 *
 * OCP: si el contrato de la API cambia, solo se modifica este mapeador.
 */
import {
  mapCategoryToApiValue,
  mapPriorityToApiValue,
} from '../data/communications';
import { sanitizeHtml } from './sanitizeHtml';
import type { AnnouncementPayload } from '../services/api';
import type { CommunicationAttachment, CommunicationMap } from '../data/communications';

/** Forma mínima del formulario necesaria para construir el payload. */
export interface AnnouncementFormValues {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  publishImmediately: boolean;
  attachments: CommunicationAttachment[];
  maps: CommunicationMap[];
}

/** Autor por defecto de los comunicados creados desde la aplicación. */
const DEFAULT_AUTHOR = 'Equipo administrativo';

export function buildAnnouncementPayload(
  formData: AnnouncementFormValues
): AnnouncementPayload {
  return {
    title: formData.title.trim(),
    category: mapCategoryToApiValue(formData.category),
    priority: mapPriorityToApiValue(formData.priority),
    content: sanitizeHtml(formData.description).trim(),
    author: DEFAULT_AUTHOR,
    publishImmediately: formData.publishImmediately,
    status: formData.publishImmediately ? 'Publicado' : 'Borrador',
    attachments: formData.attachments,
    maps: formData.maps,
  };
}
