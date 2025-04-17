export interface Ruta {
  id?: number;
  nombre_ruta: string;
  origen: string;
  destino: string;
  distancia_km?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Vehiculo {
  id?: number;
  tipo: 'moto' | 'minivan' | 'camion';
  placa: string;
  capacidad_maxima?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Transportista {
  id?: number;
  id_vehiculo: number;
  id_usuario: number;
  disponible: boolean;
  fecha_asignacion?: Date;
}

export interface AsignacionEnvio {
  id?: number;
  id_orden_envio: number;
  id_ruta: number;
  id_transportista: number;
  fecha_asignacion?: Date;
} 