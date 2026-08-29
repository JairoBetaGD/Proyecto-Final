import axios from 'axios';
import { getToken } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
});

// Adjunta el token JWT de sesión (si existe) a cada petición.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnnouncementPayload {
  title: string;
  category: string;
  priority: string;
  content: string;
  status?: string;
  author?: string;
  publishImmediately?: boolean;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
    mimeType?: string;
    /** URL pública en Vercel Blob (Mongo solo registra el enlace, no el binario). */
    url?: string;
  }>;
  /** Mapas de Google del comunicado (guardados aparte del texto). */
  maps?: Array<{
    label: string;
    url: string;
  }>;
  code?: string;
}

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getAnnouncements = async () => {
  const response = await api.get('/announcements');
  return response.data;
};

export const getAnnouncement = async (id: string) => {
  const response = await api.get(`/announcements/${id}`);
  return response.data;
};

export const createAnnouncement = async (payload: AnnouncementPayload) => {
  const response = await api.post('/announcements', payload);
  return response.data;
};

export const updateAnnouncement = async (id: string, payload: AnnouncementPayload) => {
  const response = await api.put(`/announcements/${id}`, payload);
  return response.data;
};

export const deleteAnnouncement = async (id: string) => {
  const response = await api.delete(`/announcements/${id}`);
  return response.data;
};

/**
 * Resuelve un enlace corto de Google Maps (maps.app.goo.gl / goo.gl) a su URL
 * final. Se hace en el backend porque el navegador no puede seguir la
 * redirección (CORS impide leer el «Location»).
 */
export const resolveMapUrl = async (url: string): Promise<string> => {
  const response = await api.get<{ url: string }>('/maps/resolve', {
    params: { url },
  });
  return response.data.url;
};

export default api;
