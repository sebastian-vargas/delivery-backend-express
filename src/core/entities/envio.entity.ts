export interface OrdenEnvio {
  id?: number;
  id_usuario: number;
  estado_actual: string;
  fecha_entrega?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Paquete {
  id?: number;
  id_orden_envio: number;
  tipo_envio: 'mensajeria' | 'paqueteria';
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  tipo_producto: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DireccionDestino {
  id?: number;
  id_orden_envio: number;
  calle: string;
  ciudad: string;
  departamento?: string;
  codigo_postal?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EstadoEnvio {
  id?: number;
  nombre_estado: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface HistorialEstado {
  id?: number;
  id_orden_envio: number;
  id_estado_envio: number;
  fecha_hora: Date;
  observaciones?: string;
} 