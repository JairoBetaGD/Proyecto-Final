/**
 * Rutas CRUD de comunicados.
 *
 * SRP: manejan únicamente HTTP (parsear request, responder y mapear la
 * respuesta). Las reglas de negocio (visibilidad por rol, defaults de
 * `status`/`code`, normalización de adjuntos) viven en
 * `services/announcementService.js`.
 *
 * OCP: los errores se traducen a JSON mediante `asyncHandler`; esta capa no
 * repite try/catch y los errores de negocio (HttpError/AuthError) ya llevan
 * su propio código HTTP.
 */
import { Router } from 'express';
import {
  listVisibleAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncementById,
} from '../services/announcementService.js';
import { announcementToResponse } from '../mappers/announcementMapper.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * GET /api/announcements
 *
 * Lista los comunicados visibles para la cuenta autenticada.
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const announcements = await listVisibleAnnouncements(req.auth);
    res.json(announcements.map(announcementToResponse));
  }, { message: 'Error al obtener los comunicados' })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const announcement = await getAnnouncementById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json(announcementToResponse(announcement));
  }, { message: 'Error al obtener el comunicado' })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const saved = await createAnnouncement(req.body);
    res.status(201).json(announcementToResponse(saved));
  }, { status: 400, message: 'Error al crear el comunicado' })
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await updateAnnouncement(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json(announcementToResponse(updated));
  }, { status: 400, message: 'Error al actualizar el comunicado' })
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await deleteAnnouncementById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json({ message: 'Comunicado eliminado correctamente' });
  }, { message: 'Error al eliminar el comunicado' })
);

export default router;

