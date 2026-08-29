import mongoose from 'mongoose';

/**
 * Cuenta de usuario del sistema.
 *
 * - `username`: nombre de usuario (único).
 * - `password`: contraseña hasheada con bcrypt (nunca en texto plano).
 * - `department`: departamento al que pertenece la cuenta (etiqueta de
 *   departamento). Los comunicados que ve la cuenta se filtran por este valor.
 * - `role`: `user` (ve solo su departamento) o `admin` (ve todo).
 *
 * La cuenta `admin` NO se guarda aquí: es una cuenta hardcodeada en
 * `services/authService.js` con todos los privilegios.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);