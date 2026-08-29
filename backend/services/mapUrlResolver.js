/**
 * Resolución de enlaces cortos de Google Maps.
 *
 * SRP: únicamente sigue la cadena de redirecciones HTTP de un enlace corto
 * (maps.app.goo.gl / goo.gl) y devuelve la URL final. No interpreta contenido.
 *
 * Seguridad (anti-SSRF): se valida que la URL inicial y cada «Location» de la
 * cadena pertenezcan a los dominios permitidos; nunca se sigue una
 * redirección hacia otro dominio.
 */
import http from 'node:http';
import https from 'node:https';

/** Dominios de Google para los que tiene sentido resolver redirecciones. */
export const GOOGLE_SHORT_LINK_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'maps.google.com',
  'www.google.com',
  'google.com',
]);

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 8000;

const isAllowedHop = (url, allowedHosts) =>
  (url.protocol === 'https:' || url.protocol === 'http:') &&
  allowedHosts.has(url.hostname.toLowerCase());

/**
 * Sigue las redirecciones de `targetUrl` hasta la URL final.
 *
 * @param {string} targetUrl Enlace corto a resolver.
 * @param {{ allowedHosts?: Set<string>, maxRedirects?: number }} [options]
 *   (allowedHosts permite acotar los dominios en pruebas).
 * @returns {Promise<string>} URL final (sin seguir más redirecciones).
 */
export const resolveShortLink = (targetUrl, options = {}) => {
  const {
    allowedHosts = GOOGLE_SHORT_LINK_HOSTS,
    maxRedirects = MAX_REDIRECTS,
  } = options;

  return new Promise((resolve, reject) => {
    let current;
    try {
      current = new URL(String(targetUrl || '').trim());
    } catch {
      reject(new Error('El enlace no es una URL válida'));
      return;
    }
    if (!isAllowedHop(current, allowedHosts)) {
      reject(new Error('Solo se resuelven enlaces cortos de Google Maps'));
      return;
    }

    const follow = (urlObj, remaining) => {
      const transport = urlObj.protocol === 'http:' ? http : https;
      const request = transport.request(
        urlObj,
        {
          method: 'GET',
          headers: {
            // User-Agent de navegador: goo.gl rechaza clientes sin uno.
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            Accept: 'text/html',
          },
          timeout: REQUEST_TIMEOUT_MS,
        },
        (response) => {
          const status = response.statusCode || 0;
          const location = response.headers.location;
          response.resume(); // Solo interesa la URL final, no el cuerpo.

          if (status >= 300 && status < 400 && location) {
            if (remaining <= 0) {
              reject(new Error('Demasiados redireccionamientos'));
              return;
            }
            let next;
            try {
              next = new URL(location, urlObj);
            } catch {
              reject(new Error('Redirección inválida'));
              return;
            }
            if (!isAllowedHop(next, allowedHosts)) {
              reject(new Error('Redirección hacia un dominio no permitido'));
              return;
            }
            follow(next, remaining - 1);
            return;
          }

          if (status >= 200 && status < 300) {
            resolve(urlObj.toString());
            return;
          }
          reject(new Error(`El enlace respondió con el estado ${status}`));
        }
      );
      request.on('timeout', () => {
        request.destroy(
          new Error('Tiempo de espera agotado al resolver el enlace')
        );
      });
      request.on('error', (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
      request.end();
    };

    follow(current, maxRedirects);
  });
};