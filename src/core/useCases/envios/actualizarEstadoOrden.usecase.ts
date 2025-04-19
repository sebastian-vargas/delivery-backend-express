import { 
  IOrdenEnvioRepository, 
  IEstadoEnvioRepository, 
  IHistorialEstadoRepository,
  IEnvioNotificacionService
} from '../../repositories/envio.repository.interface';
import { HistorialEstado } from '../../entities/envio.entity';
import { DomainError, ParametroRequeridoError } from '../../errors/domain-errors';

export interface ActualizarEstadoOrdenDTO {
  idOrdenEnvio: number;
  nuevoEstado: string;
  observaciones?: string;
}

export interface ActualizarEstadoOrdenResponseDTO {
  id: number;
  guia?: string;
  estado_actual: string;
  observaciones?: string;
  fecha_actualizacion: Date;
}

export class ActualizarEstadoOrdenUseCase {
  constructor(
    private ordenEnvioRepository: IOrdenEnvioRepository,
    private estadoEnvioRepository: IEstadoEnvioRepository,
    private historialEstadoRepository: IHistorialEstadoRepository,
    private envioNotificacionService: IEnvioNotificacionService
  ) {}

  async execute(data: ActualizarEstadoOrdenDTO): Promise<ActualizarEstadoOrdenResponseDTO> {
    // 1. Validar datos de entrada
    this.validarDatos(data);
    
    // 2. Verificar que la orden existe
    const orden = await this.ordenEnvioRepository.findById(data.idOrdenEnvio);
    if (!orden) {
      throw new DomainError(`No se encontró la orden de envío con ID ${data.idOrdenEnvio}`);
    }
    
    // 3. Verificar que el estado existe
    const estado = await this.estadoEnvioRepository.findByNombre(data.nuevoEstado);
    if (!estado || !estado.id) {
      throw new DomainError(`No se encontró el estado ${data.nuevoEstado} en el sistema`);
    }
    
    // 4. Actualizar el estado de la orden
    const actualizado = await this.ordenEnvioRepository.update(data.idOrdenEnvio, {
      estado_actual: data.nuevoEstado
    });
    
    if (!actualizado) {
      throw new DomainError('Error al actualizar el estado de la orden');
    }
    
    // 5. Registrar en el historial
    const fechaActualizacion = new Date();
    const historialEstado: HistorialEstado = {
      id_orden_envio: data.idOrdenEnvio,
      id_estado_envio: estado.id,
      fecha_hora: fechaActualizacion,
      observaciones: data.observaciones || `Cambio de estado a: ${data.nuevoEstado}`
    };
    
    const historial = await this.historialEstadoRepository.create(historialEstado);
    
    // 6. Enviar notificación a través de WebSockets
    await this.envioNotificacionService.notificarCambioEstado(
      data.idOrdenEnvio,
      data.nuevoEstado,
      {
        historial,
        observaciones: historialEstado.observaciones,
        fecha: fechaActualizacion,
        guia: orden.guia
      }
    );
    
    // 7. Retornar la respuesta
    return {
      id: data.idOrdenEnvio,
      guia: orden.guia,
      estado_actual: data.nuevoEstado,
      observaciones: data.observaciones,
      fecha_actualizacion: fechaActualizacion
    };
  }
  
  private validarDatos(data: ActualizarEstadoOrdenDTO): void {
    if (!data.idOrdenEnvio) {
      throw new ParametroRequeridoError('idOrdenEnvio');
    }
    
    if (!data.nuevoEstado) {
      throw new ParametroRequeridoError('nuevoEstado');
    }
  }
} 