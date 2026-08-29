import mongoose from 'mongoose';

// Sub-esquema explícito para los adjuntos.
// IMPORTANTE: no puede declararse inline con `type: [{ ... type: String }]`
// porque el campo interno llamado "type" engaña a Mongoose y convierte el
// array en `[String]`. Usar un sub-esquema nombrado evita ese problema.
const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    size: { type: String, default: '' },
    type: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

// Mapa de Google del comunicado (se guarda aparte del texto/adjuntos).
const MapSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Servicio al cliente',
    },
    priority: {
      type: String,
      required: true,
      enum: ['Alta', 'Media', 'Baja'],
      default: 'Media',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Publicado', 'Borrador', 'Archivado', 'Programado'],
      default: 'Publicado',
    },
    author: {
      type: String,
      default: 'Equipo administrativo',
    },
    publishImmediately: {
      type: Boolean,
      default: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    maps: {
      type: [MapSchema],
      default: [],
    },
    code: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Announcement', announcementSchema);
