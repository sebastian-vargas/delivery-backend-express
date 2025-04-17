import mysql from 'mysql2/promise';
import { config } from '../../config';

// Crear pool de conexiones
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
    throw error;
  }
};

// Función para ejecutar queries
export const query = async <T>(sql: string, params?: any[]): Promise<T> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

export default {
  pool,
  query,
  testConnection
}; 