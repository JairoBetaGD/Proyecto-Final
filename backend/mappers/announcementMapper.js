/**
 * Mapeadores entre documentos de Mongo y respuestas JSON.
 *
 * SRP: transformación pura de datos, sin acceso a BD ni a HTTP.
 * Mantienen la misma forma de respuesta que la versión monolítica.
 */

// Adjunto entrante -> formato Mongo (URL de Blob).
// Los archivos deben subirse previamente a Vercel Blob; este helper valida y pasa la URL.
export function toDbAttachment(att = {}) {
  return {
    name: att.name || '',
    size: att.size || '',
    type: att.type || '',
    mimeType: att.mimeType || '',
    url: att.url || '',
  };
}

// Adjunto de Mongo (URL) -> respuesta JSON.
export function attachmentToResponse(att = {}) {
  return {
    name: att.name || '',
    size: att.size || '',
    type: att.type || '',
    mimeType: att.mimeType || '',
    url: att.url || '',
  };
}

export function toDbMap(mapItem = {}) {
  return {
    label: mapItem.label || '',
    url: mapItem.url || '',
  };
}

// Mapa de Mongo -> respuesta JSON.
export function mapToResponse(mapItem = {}) {
  return {
    label: mapItem.label || '',
    url: mapItem.url || '',
  };
}

// Comunicado de Mongo -> respuesta JSON (adjuntos normalizados).
export function announcementToResponse(doc) {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...(obj || {}),
    attachments: (obj && Array.isArray(obj.attachments) ? obj.attachments : []).map(attachmentToResponse),
    maps: (obj && Array.isArray(obj.maps) ? obj.maps : []).map(mapToResponse),
  };
}

// Normaliza la lista de adjuntos de un payload entrante.
export function attachmentsPayloadToDb(payload) {
  payload.attachments = Array.isArray(payload.attachments)
    ? payload.attachments.map(toDbAttachment)
    : [];
  payload.maps = Array.isArray(payload.maps)
    ? payload.maps.map(toDbMap)
    : [];
  return payload;
}
