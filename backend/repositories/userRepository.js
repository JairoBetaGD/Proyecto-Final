/**
 * Repositorio de usuarios.
 *
 * DIP: encapsula el acceso a datos de la colección de usuarios. Los servicios
 * de autenticación dependen de esta abstracción y no del modelo directamente.
 */
import User from '../models/User.js';

export const userRepository = {
  findByUsername(username) {
    return User.findOne({ username: String(username || '').trim().toLowerCase() });
  },

  create(data) {
    const user = new User(data);
    return user.save();
  },
};