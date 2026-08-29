/**
 * Error HTTP genérico.
 *
 * OCP: cualquier capa (servicios, repositorios, rutas) puede lanzar un
 * `HttpError` con el código HTTP apropiado; el manejador central de errores
 * (`middlewares/errorHandler.js`) los traduce a respuestas JSON sin que cada
 * ruta tenga que repetir try/catch.
 */
export class HttpError extends Error {
  /**
   * @param {number} status Código HTTP con el que responder.
   * @param {string} message Mensaje legible para el cliente.
   * @param {string} [details] Detalle técnico opcional (se expone en `error`).
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}
