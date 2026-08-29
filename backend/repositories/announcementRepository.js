/**
 * Repositorio de anuncios.
 *
 * DIP: encapsula todo el acceso a datos (Mongoose). Las rutas dependen de esta
 * abstracción y no del ORM directamente, de modo que cambiar la fuente de
 * datos no afecta la capa HTTP.
 */
import Announcement from '../models/Announcement.js';

export const announcementRepository = {
  /** Lista los comunicados (filtrados opcionalmente), del más reciente al más antiguo. */
  findAll(filter = {}) {
    return Announcement.find(filter).sort({ createdAt: -1 });
  },

  findById(id) {
    return Announcement.findById(id);
  },

  /** Persiste un nuevo comunicado a partir de datos ya validados/normalizados. */
  create(data) {
    const announcement = new Announcement(data);
    return announcement.save();
  },

  updateById(id, data) {
    return Announcement.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  deleteById(id) {
    return Announcement.findByIdAndDelete(id);
  },
};
