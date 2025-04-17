import { 
  Ruta, 
  Vehiculo, 
  Transportista, 
  AsignacionEnvio 
} from '../entities/logistica.entity';

export interface IRutaRepository {
  findById(id: number): Promise<Ruta | null>;
  findByOrigenDestino(origen: string, destino: string): Promise<Ruta[]>;
  create(ruta: Ruta): Promise<Ruta>;
  update(id: number, ruta: Partial<Ruta>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, limit?: number): Promise<Ruta[]>;
}

export interface IVehiculoRepository {
  findById(id: number): Promise<Vehiculo | null>;
  findByPlaca(placa: string): Promise<Vehiculo | null>;
  create(vehiculo: Vehiculo): Promise<Vehiculo>;
  update(id: number, vehiculo: Partial<Vehiculo>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, limit?: number): Promise<Vehiculo[]>;
  findByTipo(tipo: 'moto' | 'minivan' | 'camion'): Promise<Vehiculo[]>;
}

export interface ITransportistaRepository {
  findById(id: number): Promise<Transportista | null>;
  findByUsuarioId(usuarioId: number): Promise<Transportista | null>;
  create(transportista: Transportista): Promise<Transportista>;
  update(id: number, transportista: Partial<Transportista>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, limit?: number): Promise<Transportista[]>;
  findDisponibles(): Promise<Transportista[]>;
  actualizarDisponibilidad(id: number, disponible: boolean): Promise<boolean>;
}

export interface IAsignacionEnvioRepository {
  findById(id: number): Promise<AsignacionEnvio | null>;
  findByOrdenEnvioId(ordenEnvioId: number): Promise<AsignacionEnvio | null>;
  findByTransportistaId(transportistaId: number, page?: number, limit?: number): Promise<AsignacionEnvio[]>;
  create(asignacion: AsignacionEnvio): Promise<AsignacionEnvio>;
  update(id: number, asignacion: Partial<AsignacionEnvio>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  countAsignacionesPorTransportista(transportistaId: number): Promise<number>;
} 