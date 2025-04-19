import { Request, Response } from 'express';
import { ReporteRepository } from '../repositories/reporte.repository';
import { FiltrosReporte } from '../../core/repositories/reporte.repository.interface';

export class ReporteController {
  private reporteRepository: ReporteRepository;

  constructor() {
    this.reporteRepository = new ReporteRepository();
  }

  /**
   * Obtiene un reporte detallado de envíos basado en los filtros proporcionados
   */
  public async obtenerReporteEnvios(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosReporte = this.extraerFiltros(req);
      
      const reporte = await this.reporteRepository.obtenerEnviosConFiltros(filtros);
      
      res.status(200).json({
        status: 'success',
        data: reporte
      });
    } catch (error) {
      console.error('Error al obtener reporte de envíos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al generar el reporte de envíos',
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtiene métricas de desempeño general
   */
  public async obtenerMetricas(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosReporte = this.extraerFiltros(req);
      
      const metricas = await this.reporteRepository.obtenerMetricasGenerales(filtros);
      
      res.status(200).json({
        status: 'success',
        data: metricas
      });
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener las métricas de desempeño',
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtiene métricas de desempeño por transportista
   */
  public async obtenerMetricasPorTransportista(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltrosReporte = this.extraerFiltros(req);
      
      const metricasTransportistas = await this.reporteRepository.obtenerMetricasPorTransportista(filtros);
      
      res.status(200).json({
        status: 'success',
        data: metricasTransportistas
      });
    } catch (error) {
      console.error('Error al obtener métricas por transportista:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener las métricas por transportista',
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtiene datos para gráficos de envíos por período
   */
  public async obtenerEnviosPorPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar fechaInicio y fechaFin para obtener los datos del período'
        });
        return;
      }
      
      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);
      
      const datos = await this.reporteRepository.obtenerEnviosPorPeriodo(inicio, fin);
      
      res.status(200).json({
        status: 'success',
        data: datos
      });
    } catch (error) {
      console.error('Error al obtener envíos por período:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener los datos de envíos por período',
        error: (error as Error).message
      });
    }
  }

  /**
   * Extrae los filtros de la solicitud
   */
  private extraerFiltros(req: Request): FiltrosReporte {
    const { 
      fechaInicio, 
      fechaFin, 
      estado, 
      idTransportista, 
      ciudad, 
      tipoPaquete,
      page = '1', 
      limit = '10' 
    } = req.query;
    
    const filtros: FiltrosReporte = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    };
    
    if (fechaInicio) {
      filtros.fechaInicio = new Date(fechaInicio as string);
    }
    
    if (fechaFin) {
      filtros.fechaFin = new Date(fechaFin as string);
    }
    
    if (estado) {
      filtros.estado = estado as string;
    }
    
    if (idTransportista) {
      filtros.idTransportista = parseInt(idTransportista as string, 10);
    }
    
    if (ciudad) {
      filtros.ciudad = ciudad as string;
    }
    
    if (tipoPaquete) {
      filtros.tipoPaquete = (tipoPaquete as string) === 'mensajeria' ? 'mensajeria' : 'paqueteria';
    }
    
    return filtros;
  }
} 