/**
 * Conexión a MongoDB (patrón serverless).
 *
 * SRP: concentra únicamente la responsabilidad de conectar y reutilizar la
 * conexión a MongoDB. No conoce Express ni las rutas.
 *
 * En Vercel, las funciones serverless se "congelan" entre invocaciones.
 * Reutilizamos la conexión global de Mongoose para no abrir una nueva
 * conexión en cada request (evita agotar el pool de conexiones).
 */
import mongoose from 'mongoose';
import { Resolver } from 'dns';
import dns from 'dns/promises';
import util from 'util';
import '../config/env.js';

const mongoDbName = process.env.MONGO_DB_NAME || 'Practice';

/** Indica si la conexión de Mongoose está lista (readyState 1). */
export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

/** Estado crudo de la conexión Mongoose (0..4), igual que antes del refactor. */
export const getMongooseReadyState = () => mongoose.connection.readyState;


/**
 * Devuelve la URI de MongoDB con el nombre de base de datos por defecto
 * agregado si la URI no incluye uno. Se calcula de forma diferida para que
 * se ejecute después de cargar el .env.
 */
const getFormattedMongoUri = () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/mern_practice';

  if (!mongoUri) return mongoUri;

  const uriWithoutQuery = mongoUri.split('?')[0];
  const afterProto = uriWithoutQuery.replace(/^mongodb(?:\+srv)?:\/\//, '');
  const hasDatabase =
    afterProto.includes('/') && afterProto.split('/').slice(1).join('').length > 0;

  if (hasDatabase) return mongoUri;

  console.warn(`MONGODB_URI no incluye un nombre de base de datos. Se usará '${mongoDbName}' por defecto.`);
  return mongoUri.replace(/\/?(\?|$)/, `/${mongoDbName}$1`);
};

// Variable global para reutilizar la conexión entre invocaciones serverless
let cachedDb = null;

// Convierte una URI mongodb+srv:// a una URI directa resolviendo los registros SRV manualmente.
// Esto es necesario en entornos donde la resolución DNS SRV estándar falla (como algunas redes locales).
const createDirectUriFromSrv = async (srvUri) => {
  const queryString = srvUri.includes('?') ? srvUri.slice(srvUri.indexOf('?') + 1) : 'retryWrites=true&w=majority';
  const uriWithoutQuery = srvUri.split('?')[0].replace('mongodb+srv://', '');
  const [authAndHost, dbPath] = uriWithoutQuery.split('/');
  const dbName = dbPath || mongoDbName;
  const [credentials, host] = authAndHost.includes('@') ? authAndHost.split('@') : [null, authAndHost];
  const [username, password] = credentials ? credentials.split(':') : [null, null];

  const resolveSrvRecord = async (resolver) => {
    return util.promisify(resolver.resolveSrv.bind(resolver))(`_mongodb._tcp.${host}`);
  };

  let srvRecords;
  try {
    srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`);
  } catch (error) {
    console.warn('SRV estándar falló, intentando DNS público:', error.code || error.message);
    const publicResolver = new Resolver();
    publicResolver.setServers(['1.1.1.1', '8.8.8.8']);
    srvRecords = await resolveSrvRecord(publicResolver);
  }

  const txtQuery = await (async () => {
    try {
      const txtRecords = await dns.resolveTxt(`_mongodb._tcp.${host}`);
      const flat = txtRecords.flat().join('&');
      return flat;
    } catch {
      return '';
    }
  })();

  const params = new URLSearchParams(queryString);
  if (!params.has('tls')) params.set('tls', 'true');
  if (!params.has('authSource')) params.set('authSource', 'admin');
  if (txtQuery) {
    const extraParams = new URLSearchParams(txtQuery);
    for (const [key, value] of extraParams) {
      if (!params.has(key)) {
        params.set(key, value);
      }
    }
  }

  const hosts = srvRecords.map((record) => `${record.name}:${record.port}`).join(',');
  const authSegment = username && password ? `${username}:${password}@` : '';
  const querySegment = params.toString() ? `?${params.toString()}` : '';

  return `mongodb://${authSegment}${hosts}/${dbName}${querySegment}`;
};

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  socketTimeoutMS: 45000,
  family: 4, // Forzar IPv4 para evitar problemas de DNS en Vercel
};

export async function connectToDatabase() {
  // Si ya hay una conexión activa, reutilizarla
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Si hay una conexión en curso, esperar a que termine
  if (cachedDb && mongoose.connection.readyState === 2) {
    return cachedDb;
  }

  const formattedMongoUri = getFormattedMongoUri();

  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(formattedMongoUri, MONGO_OPTIONS);
    cachedDb = mongoose.connection;
    console.log('MongoDB conectado correctamente');
    return cachedDb;
  } catch (error) {
    console.error('Error al conectar MongoDB con URI principal:', error.message || error);

    // Si la URI es SRV y falló, intentar con URI directa (resolviendo SRV manualmente)
    if (formattedMongoUri.startsWith('mongodb+srv://')) {
      try {
        const fallbackUri = await createDirectUriFromSrv(formattedMongoUri);
        console.log('Intentando conexión directa de fallback...');
        await mongoose.connect(fallbackUri, MONGO_OPTIONS);
        cachedDb = mongoose.connection;
        console.log('MongoDB conectado con URI directa de fallback');
        return cachedDb;
      } catch (fallbackError) {
        console.error('Error al conectar MongoDB con URI de fallback:', fallbackError.message || fallbackError);
      }
    }

    cachedDb = null;
    throw error;
  }
}
