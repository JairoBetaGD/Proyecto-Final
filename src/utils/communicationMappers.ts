/**
 * Mapeadores de Communication -> CommunicationDetail.
 *
 * SRP: transformación pura de modelos de dominio a modelos de presentación.
 * Elimina la duplicación que existía entre DashboardPage y AnnouncementsPage.
 *
 * OCP: las variantes de presentación se agregan como nuevas funciones aquí,
 * sin modificar las páginas que consumen los mapeadores.
 */
import {
  formatDisplayDate,
  getFileIcon,
  type Communication,
} from '../data/communications';
import type { CommunicationDetail } from '../types/communicationDetail';

/** Imagen decorativa usada en la cabecera del detalle desde el listado. */
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80';

const toDocuments = (comm: Communication) =>
  comm.attachments?.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    icon: getFileIcon(file.type),
    mimeType: file.mimeType,
    url: file.url,
  })) || [];

const toMaps = (comm: Communication) =>
  comm.maps?.map((mapItem) => ({
    label: mapItem.label,
    url: mapItem.url,
  })) || [];

/**
 * Variante Dashboard: conserva el HTML enriquecido del contenido.
 */
export const toCommunicationDetail = (comm: Communication): CommunicationDetail => ({
  id: comm.code || comm.id,
  title: comm.title,
  category: comm.category,
  priority: comm.priority,
  status: comm.status,
  content: comm.content || '',
  createdAt: formatDisplayDate(comm.createdAt || comm.date),
  updatedAt: formatDisplayDate(comm.updatedAt || comm.date),
  author: {
    name: comm.author || '',
  },
  documents: toDocuments(comm),
  maps: toMaps(comm),
});

/**
 * Variante listado: texto plano (sin etiquetas HTML), imagen decorativa y
 * autor con rol por defecto.
 */
export const toCommunicationListPreview = (
  comm: Communication
): CommunicationDetail => ({
  id: comm.code || comm.id,
  title: comm.title,
  category: comm.category,
  priority: comm.priority,
  status: comm.status,
  content:
    comm.content?.replace(/<[^>]*>/g, '') || 'Sin contenido disponible.',
  image: PLACEHOLDER_IMAGE,
  createdAt: formatDisplayDate(comm.createdAt || comm.date),
  updatedAt: formatDisplayDate(comm.updatedAt || comm.date),
  author: {
    name: comm.author || 'Equipo administrativo',
    role: 'Responsable de comunicación',
  },
  documents: toDocuments(comm),
  maps: toMaps(comm),
});
