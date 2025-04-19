import { OrdenEnvio } from '../entities/envio.entity';

export interface FiltrosReporte {
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: string;
  idTransportista?: number;
  ciudad?: string;
  tipoPaquete?: 'mensajeria' | 'paqueteria';
  page?: number;
  limit?: number;
}

export interface MetricasDesempeno {
  tiempoPromedioEntrega: number; // en horas
  totalEnvios: number;
  enviosEntregados: number;
  enviosEnTransito: number;
  enviosEnEspera: number;
  porcentajeEntregados: number;
}

export interface MetricasTransportista {
  id: number;
  nombre: string;
  tiempoPromedioEntrega: number; // en horas
  totalEnviosAsignados: number;
  enviosEntregados: number;
  porcentajeEntregados: number;
  puntualidad: number; // porcentaje de envíos entregados a tiempo
}

export interface ReporteEnvios {
  envios: OrdenEnvioDetallado[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  metricas: MetricasDesempeno;
  metricasTransportistas?: MetricasTransportista[];
}

export interface OrdenEnvioDetallado extends OrdenEnvio {
  paquete?: {
    tipo_envio: string;
    peso: number;
    dimensiones: {
      largo: number;
      ancho: number;
      alto: number;
    };
    tipo_producto: string;
  };
  direccion?: {
    calle: string;
    ciudad: string;
    departamento?: string;
    codigo_postal?: string;
  };
  transportista?: {
    id: number;
    nombre: string;
    tipo_vehiculo: string;
    placa: string;
  };
  ruta?: {
    nombre_ruta: string;
    origen: string;
    destino: string;
    distancia_km: number;
  };
  historial?: {
    id: number;
    estado: string;
    fecha: Date;
    observaciones?: string;
  }[];
  tiempoEntrega?: number; // en horas, desde la creación hasta la entrega
}

export interface IReporteRepository {
  obtenerEnviosConFiltros(filtros: FiltrosReporte): Promise<ReporteEnvios>;
  obtenerMetricasGenerales(filtros: FiltrosReporte): Promise<MetricasDesempeno>;
  obtenerMetricasPorTransportista(filtros: FiltrosReporte): Promise<MetricasTransportista[]>;
  obtenerTiempoPromedioEntrega(filtros: FiltrosReporte): Promise<number>;
  obtenerEnviosPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<{
    fecha: string;
    cantidad: number;
  }[]>;
} 