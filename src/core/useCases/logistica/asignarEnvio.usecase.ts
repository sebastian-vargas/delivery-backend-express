import { AsignacionEnvioRepository, TransportistaRepository, VehiculoRepository } from "../../../adapters/repositories/logistica.reposiroty";
import { AsignacionEnvio, Transportista, Vehiculo } from "../../entities/logistica.entity";
import { DomainError, ParametroRequeridoError } from "../../errors/domain-errors";

export interface CrearAsignarEnvioDTO {
    id_orden_envio: number;
    id_ruta: number;
    id_transportista: number;
}

export interface CrearAsignarEnvioResponseDTO {
    id: number;
    id_orden_envio:number;
    id_ruta:number;
    id_transportista:number;
    fecha_asignacion?:Date;
}

export class AsignarEnvioUseCase {
    constructor(
        private asignacionEnvioRepository: AsignacionEnvioRepository,
        private transportistaRepository:TransportistaRepository,
        private vehiculoRepository:VehiculoRepository
    ) { }

    async execute(data: CrearAsignarEnvioDTO): Promise<CrearAsignarEnvioResponseDTO> {
        // 1. Validar datos de entrada
        this.validarDatos(data);

        // 2. Validación de disponibilidad de transportista y capacidad del vehículo.
        //Nota: podría usar un servicio, pero para este caso voy a manejar la logica de negocio así 
        const transportista = await this.validarTransportista(data.id_transportista);
        const vehiculo = await this.validarVehiculo(transportista.id_vehiculo);
    
        this.validarCapacidadCarga(transportista.total_carga_actual, vehiculo.capacidad_maxima);

        //Podría validar si existe la ruta a futuro

        // 3. Crear la orden de envío
        const nuevaAsignacion: AsignacionEnvio = {
            id_orden_envio:data.id_orden_envio,
            id_ruta:data.id_ruta,
            id_transportista:data.id_transportista
        };

        const asignacionCreada = await this.asignacionEnvioRepository.create(nuevaAsignacion);

        if (!asignacionCreada.id) {
            throw new DomainError('Error al crear la asignación de envío');
        }

        
        //TODO: Podría notificar al usuario cuando se genere la orden de despacho

        // 9. Retornar la información de la asignacion creada
        return {
            id: asignacionCreada.id!,
            id_orden_envio: asignacionCreada.id_orden_envio,
            id_ruta: asignacionCreada.id_ruta,
            id_transportista: asignacionCreada.id_transportista,
            fecha_asignacion: asignacionCreada.fecha_asignacion
        };
    }

    private async validarTransportista(id: number): Promise<Transportista> {
        const transportista = await this.transportistaRepository.findById(id);
        if (!transportista || !transportista.id) {
          throw new DomainError('No se encontró el transportista en el sistema');
        }
        if (!transportista.disponible) {
          throw new DomainError('El transportista no se encuentra disponible');
        }
        return transportista;
      }
    
      private async validarVehiculo(idVehiculo: number): Promise<Vehiculo> {
        const vehiculo = await this.vehiculoRepository.findById(idVehiculo);
        if (!vehiculo || !vehiculo.id) {
          throw new DomainError('No se encontró el vehiculo asociado al transportista en el sistema');
        }
        return vehiculo;
      }
    
      private validarCapacidadCarga(cargaActual: number, capacidadMaxima: number): void {
        if (cargaActual > capacidadMaxima) {
          throw new DomainError('Se ha superado la capacidad máxima del vehiculo');
        }
    }

    private validarDatos(data: CrearAsignarEnvioDTO): void {
        if (!data.id_orden_envio) {
            throw new ParametroRequeridoError('id_orden_envio');
        }

        if (!data.id_ruta) {
            throw new ParametroRequeridoError('id_ruta');
        }

        if (!data.id_transportista) {
            throw new ParametroRequeridoError('paquete.id_transportista');
        }
    }
}