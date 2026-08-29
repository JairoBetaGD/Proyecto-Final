/**
 * Rutas de utilidades para mapas.
 *
 * SRP: maneja únicamente HTTP (parsear request, responder).
 *
 * GET /api/maps/resolve?url=… → resuelve enlaces cortos de Google Maps
 * (maps.app.goo.gl / goo.gl) a su URL final. Existe porque el navegador no
 * puede seguir la redirección de esos enlaces (CORS impide leerla) y es el
 * formato que ofrece la pestaña «Enviar un enlace» del diálogo Compartir.
 */
import { Router } from 'express';
import { resolveShortLink } from '../services/mapUrlResolver.js';

const router = Router();

router.get('/resolve', async (req, res) => {
  const target = (req.query.url || '').toString().trim();
  if (!target) {
    return res.status(400).json({ message: 'Falta el parámetro «url»' });
  }
  try {
    const url = await resolveShortLink(target);
    res.json({ url });
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo resolver el enlace',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;