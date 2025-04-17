import { OrdenEnvio } from '../../entities/envio.entity';
import { Paquete } from '../../entities/envio.entity';
import { DireccionDestino } from '../../entities/envio.entity';
import { HistorialEstado } from '../../entities/envio.entity';
import { IOrdenEnvioRepository } from '../../repositories/envio.repository.interface';
import { IPaqueteRepository } from '../../repositories/envio.repository.interface';
import { IDireccionDestinoRepository } from '../../repositories/envio.repository.interface';
import { IEstadoEnvioRepository } from '../../repositories/envio.repository.interface';
import { IHistorialEstadoRepository } from '../../repositories/envio.repository.interface';
import { ValidarDireccionUseCase } from './validarDireccion.usecase';
import { NotificarCreacionOrdenUseCase } from './notificarCreacionOrden.usecase';
import { DomainError, DireccionInvalidaError, ParametroRequeridoError } from '../../errors/domain-errors';

export interface CrearOrdenEnvioDTO {
  // Datos del usuario
  id_usuario: number;
  
  // Datos del paquete
  paquete: {
    tipo_envio: 'mensajeria' | 'paqueteria';
    peso: number;
    largo: number;
    ancho: number;
    alto: number;
    tipo_producto: string;
  };
  
  // Datos de la dirección
  direccion: {
    calle: string;
    ciudad: string;
    departamento?: string;
    codigo_postal?: string;
  };
}

export interface CrearOrdenEnvioResponseDTO {
  id: number;
  estado_actual: string;
  paquete: {
    id: number;
    tipo_envio: string;
    peso: number;
    dimensiones: {
      largo: number;
      ancho: number;
      alto: number;
    };
    tipo_producto: string;
  };
  direccion: {
    id: number;
    calle: string;
    ciudad: string;
    departamento?: string;
    codigo_postal?: string;
  };
  fecha_registro: Date;
}

export class CrearOrdenEnvioUseCase {
  constructor(
    private ordenEnvioRepository: IOrdenEnvioRepository,
    private paqueteRepository: IPaqueteRepository,
    private direccionDestinoRepository: IDireccionDestinoRepository,
    private estadoEnvioRepository: IEstadoEnvioRepository,
    private historialEstadoRepository: IHistorialEstadoRepository,
    private validarDireccionUseCase: ValidarDireccionUseCase,
    private notificarCreacionOrdenUseCase: NotificarCreacionOrdenUseCase
  ) {}

  async execute(data: CrearOrdenEnvioDTO): Promise<CrearOrdenEnvioResponseDTO> {
    // 1. Validar datos de entrada
    this.validarDatos(data);
    
    // 2. Validar la dirección usando el servicio externo
    try {
      await this.validarDireccionUseCase.execute({
        calle: data.direccion.calle,
        ciudad: data.direccion.ciudad,
        departamento: data.direccion.departamento,
        codigo_postal: data.direccion.codigo_postal
      });
      
      // Si llegamos aquí, la dirección es válida
    } catch (error) {
      // El caso de uso de validación ahora lanza un error, así que lo propagamos
      throw error;
    }
    
    // 3. Crear la orden de envío
    const nuevaOrden: OrdenEnvio = {
      id_usuario: data.id_usuario,
      estado_actual: 'en_espera', // Estado inicial
      created_at: new Date()
    };
    
    const ordenCreada = await this.ordenEnvioRepository.create(nuevaOrden);
    
    if (!ordenCreada.id) {
      throw new DomainError('Error al crear la orden de envío');
    }
    
    // 4. Crear el paquete
    const nuevoPaquete: Paquete = {
      id_orden_envio: ordenCreada.id,
      tipo_envio: data.paquete.tipo_envio,
      peso: data.paquete.peso,
      largo: data.paquete.largo,
      ancho: data.paquete.ancho,
      alto: data.paquete.alto,
      tipo_producto: data.paquete.tipo_producto
    };
    
    const paqueteCreado = await this.paqueteRepository.create(nuevoPaquete);
    
    if (!paqueteCreado.id) {
      // Si falla la creación del paquete, eliminar la orden
      await this.ordenEnvioRepository.delete(ordenCreada.id);
      throw new DomainError('Error al crear el paquete');
    }
    
    // 5. Crear la dirección de destino
    const nuevaDireccion: DireccionDestino = {
      id_orden_envio: ordenCreada.id,
      calle: data.direccion.calle,
      ciudad: data.direccion.ciudad,
      departamento: data.direccion.departamento,
      codigo_postal: data.direccion.codigo_postal
    };
    
    const direccionCreada = await this.direccionDestinoRepository.create(nuevaDireccion);
    
    if (!direccionCreada.id) {
      // Si falla la creación de la dirección, eliminar el paquete y la orden
      await this.paqueteRepository.delete(paqueteCreado.id);
      await this.ordenEnvioRepository.delete(ordenCreada.id);
      throw new DomainError('Error al registrar la dirección de destino');
    }
    
    // 6. Buscar el estado "en_espera" y registrar en el historial
    const estadoEnEspera = await this.estadoEnvioRepository.findByNombre('en_espera');
    
    if (!estadoEnEspera || !estadoEnEspera.id) {
      throw new DomainError('No se encontró el estado "en_espera" en el sistema');
    }
    
    // 7. Registrar en historial de estados
    const historialEstado: HistorialEstado = {
      id_orden_envio: ordenCreada.id,
      id_estado_envio: estadoEnEspera.id,
      fecha_hora: new Date(),
      observaciones: 'Orden creada y en espera de asignación'
    };
    
    await this.historialEstadoRepository.create(historialEstado);
    
    // 8. Enviar notificaciones (asíncrono, no esperamos a que termine)
    this.notificarCreacionOrdenUseCase.execute({
      id_usuario: data.id_usuario,
      id_orden: ordenCreada.id
    }).catch(error => {
      console.error('Error al enviar notificación:', error);
      // No interrumpimos el flujo si falla la notificación
    });
    
    // 9. Retornar la información de la orden creada
    return {
      id: ordenCreada.id,
      estado_actual: ordenCreada.estado_actual,
      paquete: {
        id: paqueteCreado.id,
        tipo_envio: paqueteCreado.tipo_envio,
        peso: paqueteCreado.peso,
        dimensiones: {
          largo: paqueteCreado.largo,
          ancho: paqueteCreado.ancho,
          alto: paqueteCreado.alto
        },
        tipo_producto: paqueteCreado.tipo_producto
      },
      direccion: {
        id: direccionCreada.id,
        calle: direccionCreada.calle,
        ciudad: direccionCreada.ciudad,
        departamento: direccionCreada.departamento,
        codigo_postal: direccionCreada.codigo_postal
      },
      fecha_registro: ordenCreada.created_at || new Date()
    };
  }
  
  private validarDatos(data: CrearOrdenEnvioDTO): void {
    // Validar usuario
    if (!data.id_usuario) {
      throw new ParametroRequeridoError('id_usuario');
    }
    
    // Validar paquete
    if (!data.paquete) {
      throw new ParametroRequeridoError('paquete');
    }
    
    if (!data.paquete.tipo_envio) {
      throw new ParametroRequeridoError('paquete.tipo_envio');
    }
    
    // Validar que peso y dimensiones sean positivos
    if (data.paquete.peso <= 0) {
      throw new DomainError('El peso del paquete debe ser mayor a 0');
    }
    
    if (data.paquete.largo <= 0 || data.paquete.ancho <= 0 || data.paquete.alto <= 0) {
      throw new DomainError('Las dimensiones del paquete deben ser mayores a 0');
    }
    
    if (!data.paquete.tipo_producto) {
      throw new ParametroRequeridoError('paquete.tipo_producto');
    }
    
    // Validar dirección
    if (!data.direccion) {
      throw new ParametroRequeridoError('direccion');
    }
    
    if (!data.direccion.calle) {
      throw new ParametroRequeridoError('direccion.calle');
    }
    
    if (!data.direccion.ciudad) {
      throw new ParametroRequeridoError('direccion.ciudad');
    }
  }
} 