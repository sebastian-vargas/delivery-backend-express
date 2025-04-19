import { 
  IReporteRepository, 
  FiltrosReporte, 
  ReporteEnvios, 
  MetricasDesempeno, 
  MetricasTransportista, 
  OrdenEnvioDetallado 
} from '../../core/repositories/reporte.repository.interface';
import { query } from '../../frameworks/database/mysql.connection';

export class ReporteRepository implements IReporteRepository {
  /**
   * Obtiene envíos con filtros avanzados y sus detalles
   */
  async obtenerEnviosConFiltros(filtros: FiltrosReporte): Promise<ReporteEnvios> {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        estado, 
        idTransportista, 
        ciudad, 
        tipoPaquete,
        page = 1, 
        limit = 10 
      } = filtros;
      
      // Construir la condición WHERE dinámica
      const condiciones: string[] = [];
      const parametros: any[] = [];
      
      if (fechaInicio) {
        condiciones.push('oe.created_at >= ?');
        parametros.push(fechaInicio);
      }
      
      if (fechaFin) {
        condiciones.push('oe.created_at <= ?');
        parametros.push(fechaFin);
      }
      
      if (estado) {
        condiciones.push('oe.estado_actual = ?');
        parametros.push(estado);
      }
      
      if (idTransportista) {
        condiciones.push('t.id = ?');
        parametros.push(idTransportista);
      }
      
      if (ciudad) {
        condiciones.push('dd.ciudad = ?');
        parametros.push(ciudad);
      }
      
      if (tipoPaquete) {
        condiciones.push('p.tipo_envio = ?');
        parametros.push(tipoPaquete);
      }
      
      const whereClause = condiciones.length > 0 
        ? `WHERE ${condiciones.join(' AND ')}` 
        : '';
      
      // Calcular offset para paginación
      const offset = (page - 1) * limit;
      
      // Parámetros para paginación
      parametros.push(limit, offset);
      
      // Consulta principal con JOINS para obtener todos los detalles
      const enviosQuery = `
        SELECT 
          oe.*,
          p.tipo_envio, p.peso, p.largo, p.ancho, p.alto, p.tipo_producto,
          dd.calle, dd.ciudad, dd.departamento, dd.codigo_postal,
          u.nombre as usuario_nombre,
          ut.nombre as transportista_nombre,
          v.tipo as tipo_vehiculo, v.placa,
          r.nombre_ruta, r.origen, r.destino, r.distancia_km,
          ae.fecha_asignacion,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', he.id,
                'estado', ee.nombre_estado,
                'fecha', he.fecha_hora,
                'observaciones', he.observaciones
              )
            )
            FROM historial_estados he
            JOIN estados_envio ee ON he.id_estado_envio = ee.id
            WHERE he.id_orden_envio = oe.id
            ORDER BY he.fecha_hora DESC
          ) as historial_json,
          (
            SELECT TIMESTAMPDIFF(HOUR, oe.created_at, he.fecha_hora)
            FROM historial_estados he
            JOIN estados_envio ee ON he.id_estado_envio = ee.id
            WHERE he.id_orden_envio = oe.id AND ee.nombre_estado = 'entregado'
            LIMIT 1
          ) as tiempo_entrega
        FROM ordenes_envio oe
        LEFT JOIN paquetes p ON p.id_orden_envio = oe.id
        LEFT JOIN direcciones_destino dd ON dd.id_orden_envio = oe.id
        LEFT JOIN usuarios u ON u.id = oe.id_usuario
        LEFT JOIN asignaciones_envio ae ON ae.id_orden_envio = oe.id
        LEFT JOIN transportistas t ON t.id = ae.id_transportista
        LEFT JOIN usuarios ut ON ut.id = t.id_usuario
        LEFT JOIN vehiculos v ON v.id = t.id_vehiculo
        LEFT JOIN rutas r ON r.id = ae.id_ruta
        ${whereClause}
        ORDER BY oe.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      // Consulta para obtener el total de registros (para paginación)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ordenes_envio oe
        LEFT JOIN paquetes p ON p.id_orden_envio = oe.id
        LEFT JOIN direcciones_destino dd ON dd.id_orden_envio = oe.id
        LEFT JOIN asignaciones_envio ae ON ae.id_orden_envio = oe.id
        LEFT JOIN transportistas t ON t.id = ae.id_transportista
        ${whereClause}
      `;
      
      // Ejecutar consultas en paralelo
      const [enviosResult, countResult, metricas] = await Promise.all([
        query<any[]>(enviosQuery, parametros),
        query<[{total: number}]>(countQuery, parametros.slice(0, -2)), // Excluir limit y offset
        this.obtenerMetricasGenerales(filtros)
      ]);
      
      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limit);
      
      // Obtener métricas por transportista si se solicitan envíos con transportista
      let metricasTransportistas: MetricasTransportista[] = [];
      if (!idTransportista) {
        metricasTransportistas = await this.obtenerMetricasPorTransportista(filtros);
      }
      
      // Transformar los resultados al formato requerido
      const enviosFormateados: OrdenEnvioDetallado[] = enviosResult.map(item => {
        const historial = item.historial_json ? JSON.parse(item.historial_json) : [];
        
        const envio: OrdenEnvioDetallado = {
          id: item.id,
          id_usuario: item.id_usuario,
          guia: item.guia,
          estado_actual: item.estado_actual,
          fecha_entrega: item.fecha_entrega,
          created_at: item.created_at,
          updated_at: item.updated_at,
          tiempoEntrega: item.tiempo_entrega
        };
        
        if (item.tipo_envio) {
          envio.paquete = {
            tipo_envio: item.tipo_envio,
            peso: item.peso,
            dimensiones: {
              largo: item.largo,
              ancho: item.ancho,
              alto: item.alto
            },
            tipo_producto: item.tipo_producto
          };
        }
        
        if (item.calle) {
          envio.direccion = {
            calle: item.calle,
            ciudad: item.ciudad,
            departamento: item.departamento,
            codigo_postal: item.codigo_postal
          };
        }
        
        if (item.transportista_nombre) {
          envio.transportista = {
            id: item.id_transportista,
            nombre: item.transportista_nombre,
            tipo_vehiculo: item.tipo_vehiculo,
            placa: item.placa
          };
        }
        
        if (item.nombre_ruta) {
          envio.ruta = {
            nombre_ruta: item.nombre_ruta,
            origen: item.origen,
            destino: item.destino,
            distancia_km: item.distancia_km
          };
        }
        
        envio.historial = historial;
        
        return envio;
      });
      
      return {
        envios: enviosFormateados,
        totalItems,
        totalPages,
        currentPage: page,
        metricas,
        metricasTransportistas: metricasTransportistas.length > 0 ? metricasTransportistas : undefined
      };
    } catch (error) {
      console.error('Error en obtenerEnviosConFiltros:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene métricas generales de desempeño
   */
  async obtenerMetricasGenerales(filtros: FiltrosReporte): Promise<MetricasDesempeno> {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        idTransportista, 
        ciudad 
      } = filtros;
      
      // Construir la condición WHERE dinámica
      const condiciones: string[] = [];
      const parametros: any[] = [];
      
      if (fechaInicio) {
        condiciones.push('oe.created_at >= ?');
        parametros.push(fechaInicio);
      }
      
      if (fechaFin) {
        condiciones.push('oe.created_at <= ?');
        parametros.push(fechaFin);
      }
      
      if (idTransportista) {
        condiciones.push('t.id = ?');
        parametros.push(idTransportista);
      }
      
      if (ciudad) {
        condiciones.push('dd.ciudad = ?');
        parametros.push(ciudad);
      }
      
      const whereClause = condiciones.length > 0 
        ? `WHERE ${condiciones.join(' AND ')}` 
        : '';
      
      const metricasQuery = `
        SELECT
          COUNT(oe.id) as total_envios,
          SUM(CASE WHEN oe.estado_actual = 'entregado' THEN 1 ELSE 0 END) as envios_entregados,
          SUM(CASE WHEN oe.estado_actual = 'en_transito' THEN 1 ELSE 0 END) as envios_en_transito,
          SUM(CASE WHEN oe.estado_actual = 'en_espera' THEN 1 ELSE 0 END) as envios_en_espera,
          AVG(
            CASE 
              WHEN oe.estado_actual = 'entregado' THEN 
                (SELECT TIMESTAMPDIFF(HOUR, oe.created_at, he.fecha_hora)
                FROM historial_estados he
                JOIN estados_envio ee ON he.id_estado_envio = ee.id
                WHERE he.id_orden_envio = oe.id AND ee.nombre_estado = 'entregado'
                ORDER BY he.fecha_hora ASC
                LIMIT 1)
              ELSE NULL
            END
          ) as tiempo_promedio_entrega
        FROM ordenes_envio oe
        LEFT JOIN direcciones_destino dd ON dd.id_orden_envio = oe.id
        LEFT JOIN asignaciones_envio ae ON ae.id_orden_envio = oe.id
        LEFT JOIN transportistas t ON t.id = ae.id_transportista
        ${whereClause}
      `;
      
      const [result] = await query<any[]>(metricasQuery, parametros);
      
      const totalEnvios = result.total_envios || 0;
      const enviosEntregados = result.envios_entregados || 0;
      
      return {
        totalEnvios,
        enviosEntregados,
        enviosEnTransito: result.envios_en_transito || 0,
        enviosEnEspera: result.envios_en_espera || 0,
        tiempoPromedioEntrega: result.tiempo_promedio_entrega || 0,
        porcentajeEntregados: totalEnvios > 0 ? (enviosEntregados / totalEnvios) * 100 : 0
      };
    } catch (error) {
      console.error('Error en obtenerMetricasGenerales:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene métricas de desempeño por transportista
   */
  async obtenerMetricasPorTransportista(filtros: FiltrosReporte): Promise<MetricasTransportista[]> {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        idTransportista
      } = filtros;
      
      // Construir la condición WHERE dinámica
      const condiciones: string[] = [];
      const parametros: any[] = [];
      
      if (fechaInicio) {
        condiciones.push('oe.created_at >= ?');
        parametros.push(fechaInicio);
      }
      
      if (fechaFin) {
        condiciones.push('oe.created_at <= ?');
        parametros.push(fechaFin);
      }
      
      if (idTransportista) {
        condiciones.push('t.id = ?');
        parametros.push(idTransportista);
      }
      
      const whereClause = condiciones.length > 0 
        ? `WHERE ${condiciones.join(' AND ')}` 
        : '';
      
      const metricasTransportistaQuery = `
        SELECT
          t.id,
          u.nombre,
          COUNT(oe.id) as total_envios_asignados,
          SUM(CASE WHEN oe.estado_actual = 'entregado' THEN 1 ELSE 0 END) as envios_entregados,
          AVG(
            CASE 
              WHEN oe.estado_actual = 'entregado' THEN 
                (SELECT TIMESTAMPDIFF(HOUR, oe.created_at, he.fecha_hora)
                FROM historial_estados he
                JOIN estados_envio ee ON he.id_estado_envio = ee.id
                WHERE he.id_orden_envio = oe.id AND ee.nombre_estado = 'entregado'
                ORDER BY he.fecha_hora ASC
                LIMIT 1)
              ELSE NULL
            END
          ) as tiempo_promedio_entrega,
          SUM(CASE 
            WHEN oe.estado_actual = 'entregado' AND oe.fecha_entrega IS NOT NULL AND 
                (SELECT TIMESTAMPDIFF(HOUR, oe.created_at, he.fecha_hora)
                FROM historial_estados he
                JOIN estados_envio ee ON he.id_estado_envio = ee.id
                WHERE he.id_orden_envio = oe.id AND ee.nombre_estado = 'entregado'
                ORDER BY he.fecha_hora ASC
                LIMIT 1) <= 48 THEN 1 
            ELSE 0 
          END) as entregas_a_tiempo,
          COUNT(CASE WHEN oe.estado_actual = 'entregado' THEN 1 ELSE NULL END) as total_entregas
        FROM transportistas t
        JOIN usuarios u ON t.id_usuario = u.id
        LEFT JOIN asignaciones_envio ae ON ae.id_transportista = t.id
        LEFT JOIN ordenes_envio oe ON oe.id = ae.id_orden_envio
        ${whereClause}
        GROUP BY t.id, u.nombre
        ORDER BY envios_entregados DESC
      `;
      
      const transportistasResult = await query<any[]>(metricasTransportistaQuery, parametros);
      
      return transportistasResult.map(t => {
        const totalEnviosAsignados = t.total_envios_asignados || 0;
        const enviosEntregados = t.envios_entregados || 0;
        const entregasATiempo = t.entregas_a_tiempo || 0;
        const totalEntregas = t.total_entregas || 0;
        
        return {
          id: t.id,
          nombre: t.nombre,
          totalEnviosAsignados,
          enviosEntregados,
          tiempoPromedioEntrega: t.tiempo_promedio_entrega || 0,
          porcentajeEntregados: totalEnviosAsignados > 0 ? (enviosEntregados / totalEnviosAsignados) * 100 : 0,
          puntualidad: totalEntregas > 0 ? (entregasATiempo / totalEntregas) * 100 : 0
        };
      });
    } catch (error) {
      console.error('Error en obtenerMetricasPorTransportista:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene el tiempo promedio de entrega
   */
  async obtenerTiempoPromedioEntrega(filtros: FiltrosReporte): Promise<number> {
    try {
      const metricas = await this.obtenerMetricasGenerales(filtros);
      return metricas.tiempoPromedioEntrega;
    } catch (error) {
      console.error('Error en obtenerTiempoPromedioEntrega:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene la cantidad de envíos por período (para gráficos)
   */
  async obtenerEnviosPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<{ fecha: string; cantidad: number; }[]> {
    try {
      // Determinar si el período es por días, semanas o meses según el rango de fechas
      const diffDays = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      
      let formatoFecha: string;
      let groupBy: string;
      
      if (diffDays <= 31) {
        // Por día si el rango es menor o igual a un mes
        formatoFecha = '%Y-%m-%d';
        groupBy = 'dia';
      } else if (diffDays <= 90) {
        // Por semana si el rango es entre 1 y 3 meses
        formatoFecha = '%Y-%u'; // Año-Semana
        groupBy = 'semana';
      } else {
        // Por mes para rangos mayores
        formatoFecha = '%Y-%m';
        groupBy = 'mes';
      }
      
      const query = `
        SELECT 
          DATE_FORMAT(created_at, ?) as fecha,
          COUNT(*) as cantidad
        FROM ordenes_envio
        WHERE created_at BETWEEN ? AND ?
        GROUP BY fecha
        ORDER BY fecha ASC
      `;
      
      const result = await this.query<Array<{ fecha: string; cantidad: number }>>(
        query,
        [formatoFecha, fechaInicio, fechaFin]
      );
      
      return result;
    } catch (error) {
      console.error('Error en obtenerEnviosPorPeriodo:', error);
      throw error;
    }
  }
  
  // Método helper para ejecutar consultas
  private async query<T>(sql: string, params: any[] = []): Promise<T> {
    return query<T>(sql, params);
  }
} 