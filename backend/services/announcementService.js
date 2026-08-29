/**
 * Servicio de negocio de comunicados.
 *
 * SRP: concentra las reglas de negocio (visibilidad por rol, valores por
 * defecto al crear, normalización del payload) y la orquestación del
 * repositorio. Las rutas solo traducen HTTP; el repositorio solo habla con
 * Mongoose.
 *
 * DIP: depende de `announcementRepository` y de mapeadores puros, no de
 * Mongoose ni de Express. Cambiar la fuente de datos no afecta la capa HTTP.
 */
import { announcementRepository } from '../repositories/announcementRepository.js';
import { attachmentsPayloadToDb } from '../mappers/announcementMapper.js';

/**
 * Filtro de visibilidad según la cuenta autenticada:
 *  - admin: ve TODOS los comunicados.
 *  - resto: solo los de su departamento (campo `category`).
 */
export function visibilityFilterFor(auth) {
  return auth?.role === 'admin' ? {} : { category: auth?.department };
}

/** Código público del comunicado: COM-<año>-<serial corto>. */
export function generateAnnouncementCode(now = new Date()) {
  return `COM-${now.getFullYear()}-${String(now.getTime()).slice(-4)}`;
}

/**
 * Aplica los valores por defecto del contrato de creación:
 *  - `status`: 'Publicado' si se publica de inmediato, 'Borrador' si no.
 *  - `code`: código público si el cliente no envía uno.
 */
export function withCreationDefaults(data) {
  return {
    ...data,
    status: data.status || (data.publishImmediately ? 'Publicado' : 'Borrador'),
    code: data.code || generateAnnouncementCode(),
  };
}

/** Lista los comunicados visibles para la cuenta, del más reciente al más antiguo. */
export function listVisibleAnnouncements(auth) {
  return announcementRepository.findAll(visibilityFilterFor(auth));
}

/** Obtiene un comunicado por su id (o null si no existe). */
export function getAnnouncementById(id) {
  return announcementRepository.findById(id);
}

/** Crea un comunicado normalizando adjuntos/mapas y aplicando los defaults. */
export function createAnnouncement(input) {
  const payload = attachmentsPayloadToDb(input ?? {});
  return announcementRepository.create(withCreationDefaults(payload));
}

/** Actualiza un comunicado normalizando el payload entrante. */
export function updateAnnouncement(id, input) {
  const payload = attachmentsPayloadToDb(input ?? {});
  return announcementRepository.updateById(id, payload);
}

/** Elimina un comunicado por su id (o null si no existe). */
export function deleteAnnouncementById(id) {
  return announcementRepository.deleteById(id);
}
