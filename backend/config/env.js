/**
 * Carga de variables de entorno.
 *
 * SRP: este módulo tiene una única responsabilidad - cargar el .env del
 * directorio backend. Cualquier módulo que lea process.env en tiempo de
 * importación debe importar este archivo primero, porque en ESM las
 * importaciones se evalúan antes del cuerpo del módulo importador.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
