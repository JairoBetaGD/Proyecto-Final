/**
 * Rutas CRUD de comunicados.
 *
 * SRP: manejan únicamente HTTP (parsear request, responder).
 * DIP: acceden a los datos a través del repositorio y transforman con
 * mapeadores puros, sin conocer Mongoose.
 *
 * La lógica de negocio de defaults (status y código) vive aquí porque es
 * específica del contrato HTTP de creación.
 */
import { Router } from 'express';
import { announcementRepository } from '../repositories/announcementRepository.js';
import {
  announcementToResponse,
  attachmentsPayloadToDb,
} from '../mappers/announcementMapper.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const announcements = await announcementRepository.findAll();
    res.json(announcements.map(announcementToResponse));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los comunicados', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const announcement = await announcementRepository.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json(announcementToResponse(announcement));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el comunicado', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = attachmentsPayloadToDb(req.body);

    const saved = await announcementRepository.create({
      ...payload,
      status: payload.status || (payload.publishImmediately ? 'Publicado' : 'Borrador'),
      code: payload.code || `COM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    });
    res.status(201).json(announcementToResponse(saved));
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el comunicado', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = attachmentsPayloadToDb(req.body);

    const updated = await announcementRepository.updateById(req.params.id, payload);
    if (!updated) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json(announcementToResponse(updated));
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el comunicado', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await announcementRepository.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Comunicado no encontrado' });
    }
    res.json({ message: 'Comunicado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el comunicado', error: error.message });
  }
});

export default router;
