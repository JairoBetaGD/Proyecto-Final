/**
 * Punto de entrada del backend (composition root).
 *
 * Tras la refactorización SOLID, este archivo solo:
 *  - configura Express y middleware,
 *  - monta los routers modularizados,
 *  - exporta la app para Vercel,
 *  - arranca el servidor local cuando no se ejecuta en Vercel.
 *
 * La conexión a BD vive en db/connection.js, el acceso a datos en
 * repositories/, la subida de archivos en services/ y las rutas en routes/.
 */
import express from 'express';
import cors from 'cors';
import './config/env.js';
import healthRoutes from './routes/health.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import announcementsRoutes from './routes/announcements.routes.js';
import mapsRoutes from './routes/maps.routes.js';
import { connectToDatabase } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Middleware que garantiza la conexión a la BD antes de cada request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error de conexión a la base de datos',
      error: error.message,
    });
  }
});

// ============================================
// RUTAS DE LA API
// ============================================

app.use('/api', healthRoutes);
app.use('/api', uploadRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/maps', mapsRoutes);

// ============================================
// EXPORTACIÓN PARA VERCEL
// ============================================

// Export the app for Vercel serverless functions
export default app;

// Start the server only when run directly (not when imported by Vercel)
if (!process.env.VERCEL) {
  // Conectar a la BD al iniciar el servidor local
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error inicial al conectar MongoDB:', error.message || error);
      // Aún así iniciar el servidor para que /api/health muestre el estado
      app.listen(PORT, () => {
        console.log(`Servidor backend ejecutándose en http://localhost:${PORT} (sin BD)`);
      });
    });
}
