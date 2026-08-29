/**
 * Manejo centralizado de errores HTTP.
 *
 * SRP: traducir un error lanzado por cualquier capa a una respuesta JSON en
 * un único lugar. Cada ruta solo declara su código/mensaje por defecto.
 *
 * OCP: los errores de negocio (`HttpError` y subclases como `AuthError`)
 * llevan su propio `status`/`message`; agregar un tipo de error nuevo no
 * obliga a modificar las rutas.
 */
import { HttpError } from '../utils/httpError.js';

/** Indica si el error ya trae su propio código HTTP (error de negocio). */
const hasHttpStatus = (error) => Boolean(error) && typeof error.status === 'number';

/**
 * Envuelve un handler async para que cualquier error se traduzca a JSON por
 * el mismo camino. `options.status` y `options.message` describen la
 * respuesta por defecto de esa ruta cuando el error NO es de negocio.
 *
 * Ejemplo:
 *   router.post('/', asyncHandler(handler, { status: 400, message: 'Error al crear' }));
 *
 * @param {(req: import('express').Request, res: import('express').Response) => Promise<void>} handler
 * @param {{ status?: number, message?: string }} [options]
 */
export const asyncHandler = (handler, options = {}) =>
  async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const isBusinessError = hasHttpStatus(error);
      const status = isBusinessError ? error.status : options.status ?? 500;
      // Los errores de negocio traen su propio mensaje (HttpError/AuthError);
      // para errores inesperados la ruta declara un mensaje de contexto.
      const message = isBusinessError
        ? error.message
        : options.message ?? error?.message ?? 'Error interno del servidor';
      res.status(status).json({
        message,
        ...(error?.details ?? error?.message
          ? { error: error.details ?? error.message }
          : {}),
      });
    }
  };

/**
 * Middleware global (al final de la pila): captura errores síncronos que
 * Express reenvía (p. ej. JSON malformado detectado por `express.json`) y
 * responde en JSON en lugar de la página HTML por defecto.
 */
export function globalErrorHandler(error, req, res, _next) {
  const status = hasHttpStatus(error)
    ? error.status
    : typeof error?.statusCode === 'number'
      ? error.statusCode
      : 500;

  if (status >= 500) {
    console.error('[api] Error no controlado:', error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    message: status < 500 ? error?.message || 'Solicitud inválida' : 'Error interno del servidor',
  });
}
