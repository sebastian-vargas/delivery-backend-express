import { createClient } from 'redis';
import { config } from '../../config';

// Crear cliente Redis
const redisClient = createClient({
  url: `redis://${config.redis.password ? ':' + config.redis.password + '@' : ''}${config.redis.host}:${config.redis.port}`
});

// Conectar Redis
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Conexión a Redis establecida correctamente');
  } catch (error) {
    console.error('Error al conectar a Redis:', error);
    throw error;
  }
};

// Cerrar conexión Redis
export const closeRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    console.log('Conexión a Redis cerrada correctamente');
  } catch (error) {
    console.error('Error al cerrar la conexión a Redis:', error);
    throw error;
  }
};

// Funciones para trabajar con caching
export const setCache = async (key: string, value: any, expireTime = 3600): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: expireTime });
  } catch (error) {
    console.error('Error al guardar en caché:', error);
    throw error;
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) as T : null;
  } catch (error) {
    console.error('Error al obtener de caché:', error);
    throw error;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error al eliminar de caché:', error);
    throw error;
  }
};

export default {
  redisClient,
  connectRedis,
  closeRedis,
  setCache,
  getCache,
  deleteCache
}; 