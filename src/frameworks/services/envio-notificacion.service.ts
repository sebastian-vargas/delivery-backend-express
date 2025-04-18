import { IEnvioNotificacionService } from '../../core/repositories/envio.repository.interface';
import socketService from '../web/socket/socket.service';
import { setCache, getCache } from '../database/redis.connection';

export class EnvioNotificacionService implements IEnvioNotificacionService {
  // Prefijo para las claves de notificaciones en Redis
  private readonly NOTIFICACION_KEY_PREFIX = 'notificacion:orden:';
  
  // Tiempo de expiración de notificaciones en Redis (1 semana)
  private readonly NOTIFICACION_EXPIRY = 7 * 24 * 60 * 60;
  
  // Número máximo de notificaciones a guardar por orden
  private readonly MAX_NOTIFICACIONES = 10;
  
  /**
   * Genera la clave para Redis basada en el ID de la orden
   */
  private generateKey(ordenEnvioId: number): string {
    return `${this.NOTIFICACION_KEY_PREFIX}${ordenEnvioId}`;
  }
  
  /**
   * Obtiene las notificaciones recientes para una orden
   */
  public async getNotificacionesRecientes(ordenEnvioId: number): Promise<any[]> {
    try {
      const key = this.generateKey(ordenEnvioId);
      const notificaciones = await getCache<any[]>(key);
      return notificaciones || [];
    } catch (error) {
      console.error('Error al obtener notificaciones de Redis:', error);
      return [];
    }
  }
  
  /**
   * Guarda una notificación en Redis
   */
  private async guardarNotificacion(ordenEnvioId: number, payload: any): Promise<void> {
    try {
      const key = this.generateKey(ordenEnvioId);
      
      // Obtener notificaciones existentes
      const notificacionesExistentes = await this.getNotificacionesRecientes(ordenEnvioId);
      
      // Añadir nueva notificación al principio y limitar a MAX_NOTIFICACIONES
      const notificacionesActualizadas = [payload, ...notificacionesExistentes]
        .slice(0, this.MAX_NOTIFICACIONES);
      
      // Guardar en Redis
      await setCache(key, notificacionesActualizadas, this.NOTIFICACION_EXPIRY);
    } catch (error) {
      console.error('Error al guardar notificación en Redis:', error);
    }
  }
  
  async notificarCambioEstado(idOrdenEnvio: number, nuevoEstado: string, detalles: any): Promise<void> {
    try {
      // Crear la sala con el ID de la orden de envío como identificador
      const roomId = `orden_${idOrdenEnvio}`;
      
      // Crear el payload de la notificación
      const payload = {
        idOrdenEnvio,
        estado: nuevoEstado,
        fecha: new Date(),
        detalles
      };
      
      // Emitir el evento a la sala específica
      socketService.emitToRoom(roomId, 'cambio_estado', payload);
      
      // También emitimos a una sala general de actualizaciones para dashboard admin
      socketService.emitToRoom('admin_updates', 'cambio_estado', payload);
      
      // Guardar la notificación en Redis para recuperarla más tarde
      await this.guardarNotificacion(idOrdenEnvio, payload);
      
      console.log(`Notificación de cambio de estado enviada para orden ${idOrdenEnvio}: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al enviar notificación WebSocket:', error);
      // No lanzamos el error para que no interrumpa el flujo principal
    }
  }
}

export default new EnvioNotificacionService(); 