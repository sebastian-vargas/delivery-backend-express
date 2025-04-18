import { 
  OrdenEnvio, 
  Paquete, 
  DireccionDestino, 
  EstadoEnvio, 
  HistorialEstado 
} from '../entities/envio.entity';

export interface IOrdenEnvioRepository {
  findById(id: number): Promise<OrdenEnvio | null>;
  findByGuia(guia: string): Promise<OrdenEnvio | null>;
  findByUsuarioId(usuarioId: number, page?: number, limit?: number): Promise<OrdenEnvio[]>;
  create(ordenEnvio: OrdenEnvio): Promise<OrdenEnvio>;
  update(id: number, ordenEnvio: Partial<OrdenEnvio>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, limit?: number): Promise<OrdenEnvio[]>;
  countByEstado(estado: string): Promise<number>;
}

export interface IPaqueteRepository {
  findById(id: number): Promise<Paquete | null>;
  findByOrdenEnvioId(ordenEnvioId: number): Promise<Paquete[]>;
  create(paquete: Paquete): Promise<Paquete>;
  update(id: number, paquete: Partial<Paquete>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

export interface IDireccionDestinoRepository {
  findById(id: number): Promise<DireccionDestino | null>;
  findByOrdenEnvioId(ordenEnvioId: number): Promise<DireccionDestino | null>;
  create(direccion: DireccionDestino): Promise<DireccionDestino>;
  update(id: number, direccion: Partial<DireccionDestino>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

export interface IEstadoEnvioRepository {
  findById(id: number): Promise<EstadoEnvio | null>;
  findByNombre(nombre: string): Promise<EstadoEnvio | null>;
  create(estado: EstadoEnvio): Promise<EstadoEnvio>;
  update(id: number, estado: Partial<EstadoEnvio>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<EstadoEnvio[]>;
}

export interface IHistorialEstadoRepository {
  findById(id: number): Promise<HistorialEstado | null>;
  findByOrdenEnvioId(ordenEnvioId: number): Promise<HistorialEstado[]>;
  create(historial: HistorialEstado): Promise<HistorialEstado>;
  findUltimoEstado(ordenEnvioId: number): Promise<HistorialEstado | null>;
} 