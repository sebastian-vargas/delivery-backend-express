import { HistorialEstado } from '../../core/entities/envio.entity';
import { setCache, getCache } from '../database/redis.connection';

export class HistorialCacheService {
  private static instance: HistorialCacheService;
  
  // Tiempo de expiración de la caché en segundos (3 días)
  private readonly CACHE_EXPIRY = 3 * 24 * 60 * 60;
  
  private constructor() {}
  
  public static getInstance(): HistorialCacheService {
    if (!HistorialCacheService.instance) {
      HistorialCacheService.instance = new HistorialCacheService();
    }
    return HistorialCacheService.instance;
  }
  
  /**
   * Genera la clave para Redis basada en el ID de la orden
   */
  private generateKey(ordenEnvioId: number): string {
    return `historial:orden:${ordenEnvioId}`;
  }
  
  /**
   * Guarda un evento de historial en Redis
   */
  public async saveHistorialEvento(historialItem: HistorialEstado): Promise<void> {
    try {
      const key = this.generateKey(historialItem.id_orden_envio);
      
      // Obtener la lista actual de eventos (si existe)
      const historialActual = await this.getHistorialEventos(historialItem.id_orden_envio);
      
      // Añadir el nuevo evento al principio de la lista
      const updatedHistorial = [historialItem, ...historialActual];
      
      // Guardar la lista actualizada
      await setCache(key, updatedHistorial, this.CACHE_EXPIRY);
    } catch (error) {
      console.error('Error al guardar historial en caché:', error);
      // No lanzamos el error para que no interrumpa el flujo principal
    }
  }
  
  /**
   * Obtiene todos los eventos de historial para una orden desde Redis
   */
  public async getHistorialEventos(ordenEnvioId: number): Promise<HistorialEstado[]> {
    try {
      const key = this.generateKey(ordenEnvioId);
      const cachedData = await getCache<HistorialEstado[]>(key);
      
      return cachedData || [];
    } catch (error) {
      console.error('Error al obtener historial desde caché:', error);
      return [];
    }
  }
  
  /**
   * Obtiene el último evento de historial para una orden desde Redis
   */
  public async getUltimoEvento(ordenEnvioId: number): Promise<HistorialEstado | null> {
    try {
      const historial = await this.getHistorialEventos(ordenEnvioId);
      
      return historial.length > 0 ? historial[0] : null;
    } catch (error) {
      console.error('Error al obtener último evento desde caché:', error);
      return null;
    }
  }
}

export default HistorialCacheService.getInstance(); 