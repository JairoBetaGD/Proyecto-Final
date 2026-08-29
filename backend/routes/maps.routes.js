/**
 * Rutas de utilidades para mapas.
 *
 * SRP: maneja únicamente HTTP (parsear request, responder).
 *
 * GET /api/maps/resolve?url=… → resuelve enlaces cortos de Google Maps
 * (maps.app.goo.gl / goo.gl) a su URL final. Existe porque el navegador no
 * puede seguir la redirección de esos enlaces (CORS impide leerla) y es el
 * formato que ofrece la pestaña «Enviar un enlace» del diálogo Compartir.
 *
 * OCP: los errores se traducen a JSON mediante `asyncHandler`; esta capa no
 * repite try/catch.
 */
import { Router } from 'express';
import { resolveShortLink } from '../services/mapUrlResolver.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = Router();

router.get(
  '/resolve',
  asyncHandler(async (req, res) => {
    const target = (req.query.url || '').toString().trim();
    if (!target) {
      return res.status(400).json({ message: 'Falta el parámetro «url»' });
    }
    const url = await resolveShortLink(target);
    res.json({ url });
  }, { status: 400, message: 'No se pudo resolver el enlace' })
);

export default router;
