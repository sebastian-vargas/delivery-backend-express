import { Request, Response, NextFunction } from 'express';
import { CrearOrdenEnvioUseCase } from '../../core/useCases/envios/crearOrden.usecase';
import { ValidarDireccionUseCase } from '../../core/useCases/envios/validarDireccion.usecase';
import { ActualizarEstadoOrdenUseCase } from '../../core/useCases/envios/actualizarEstadoOrden.usecase';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../../frameworks/web/errors/http-errors';
import { ParametroRequeridoError } from '../../core/errors/domain-errors';
import { 
  IOrdenEnvioRepository, 
  IPaqueteRepository,
  IDireccionDestinoRepository,
  IHistorialEstadoRepository,
  IEnvioNotificacionService 
} from '../../core/repositories/envio.repository.interface';

export class EnvioController {
  constructor(
    private crearOrdenEnvioUseCase: CrearOrdenEnvioUseCase,
    private validarDireccionUseCase: ValidarDireccionUseCase,
    private actualizarEstadoOrdenUseCase: ActualizarEstadoOrdenUseCase,
    private ordenEnvioRepository: IOrdenEnvioRepository,
    private paqueteRepository: IPaqueteRepository,
    private direccionDestinoRepository: IDireccionDestinoRepository,
    private historialEstadoRepository: IHistorialEstadoRepository,
    private envioNotificacionService: IEnvioNotificacionService
  ) {}

  async crearOrden(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para crear órdenes de envío');
      }

      const { paquete, direccion } = req.body;

      // Validaciones básicas
      if (!paquete) {
        throw new ParametroRequeridoError('paquete');
      }
      
      if (!direccion) {
        throw new ParametroRequeridoError('direccion');
      }

      // Crear la orden de envío
      const resultado = await this.crearOrdenEnvioUseCase.execute({
        id_usuario: req.user.userId,
        paquete,
        direccion
      });

      res.status(201).json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      // Pasar al middleware global de errores
      next(error);
    }
  }

  async validarDireccion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { calle, ciudad, departamento, codigo_postal } = req.body;
      
      // Validaciones básicas
      if (!calle) {
        throw new ParametroRequeridoError('calle');
      }
      
      if (!ciudad) {
        throw new ParametroRequeridoError('ciudad');
      }
      
      // Validar la dirección
      const resultado = await this.validarDireccionUseCase.execute({
        calle,
        ciudad,
        departamento,
        codigo_postal
      });
      
      res.status(200).json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }
  
  async listarEnviosUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para ver sus envíos');
      }
      
      // Esta función se implementará más adelante para obtener los envíos de un usuario
      // Por ahora lanzamos un error NotFoundError indicando que no está implementado
      throw new NotFoundError('Endpoint no implementado todavía');
    } catch (error) {
      next(error);
    }
  }
  
  async obtenerEnvioPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para ver detalles de envío');
      }
      
      const { id } = req.params;
      
      if (!id) {
        throw new ParametroRequeridoError('id');
      }
      
      const ordenId = parseInt(id, 10);
      if (isNaN(ordenId)) {
        throw new BadRequestError('El ID debe ser un número válido');
      }
      
      const orden = await this.ordenEnvioRepository.findById(ordenId);
      
      if (!orden) {
        throw new NotFoundError(`No se encontró la orden de envío con ID ${id}`);
      }
      
      // Verificar que la orden pertenezca al usuario autenticado
      if (orden.id_usuario !== req.user.userId) {
        throw new UnauthorizedError('No tiene permisos para ver esta orden de envío');
      }
      
      // Obtener paquete, dirección y historial
      const paquete = await this.paqueteRepository.findByOrdenEnvioId(orden.id!);
      const direccion = await this.direccionDestinoRepository.findByOrdenEnvioId(orden.id!);
      const historial = await this.historialEstadoRepository.findByOrdenEnvioId(orden.id!);
      
      res.status(200).json({
        status: 'success',
        data: {
          orden,
          paquete,
          direccion,
          historial
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async obtenerEnvioPorGuia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para ver detalles de envío');
      }
      
      const { guia } = req.params;
      
      if (!guia) {
        throw new ParametroRequeridoError('guia');
      }
      
      const orden = await this.ordenEnvioRepository.findByGuia(guia);
      
      if (!orden) {
        throw new NotFoundError(`No se encontró la orden de envío con guía ${guia}`);
      }
      
      // Verificar que la orden pertenezca al usuario autenticado
      if (orden.id_usuario !== req.user.userId) {
        throw new UnauthorizedError('No tiene permisos para ver esta orden de envío');
      }
      
      // Obtener paquete, dirección y historial
      const paquete = await this.paqueteRepository.findByOrdenEnvioId(orden.id!);
      const direccion = await this.direccionDestinoRepository.findByOrdenEnvioId(orden.id!);
      const historial = await this.historialEstadoRepository.findByOrdenEnvioId(orden.id!);
      
      res.status(200).json({
        status: 'success',
        data: {
          orden,
          paquete,
          direccion,
          historial
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerOrdenesPorEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para ver detalles de envío');
      }
      
      const { estado } = req.params;
      
      if (!estado) {
        throw new ParametroRequeridoError('estado');
      }
      
      const ordenes = await this.ordenEnvioRepository.findByEstado(estado);
      
      if (!ordenes) {
        throw new NotFoundError(`No se encontraron ordenes con el estado ${estado}`);
      }
      
      res.status(200).json({
        status: 'success',
        data: ordenes
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizarEstadoOrden(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para actualizar órdenes de envío');
      }
      
      // La validación de permisos se realiza en la ruta con middleware
      
      const { id } = req.params;
      const { nuevoEstado, observaciones } = req.body;
      
      if (!id) {
        throw new ParametroRequeridoError('id');
      }
      
      if (!nuevoEstado) {
        throw new ParametroRequeridoError('nuevoEstado');
      }
      
      const idOrdenEnvio = parseInt(id, 10);
      if (isNaN(idOrdenEnvio)) {
        throw new BadRequestError('El ID debe ser un número válido');
      }
      
      const resultado = await this.actualizarEstadoOrdenUseCase.execute({
        idOrdenEnvio,
        nuevoEstado,
        observaciones
      });
      
      res.status(200).json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerHistorialCambiosRecientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError('Debe estar autenticado para ver el historial de cambios');
      }
      
      const { id } = req.params;
      
      if (!id) {
        throw new ParametroRequeridoError('id');
      }
      
      const ordenId = parseInt(id, 10);
      if (isNaN(ordenId)) {
        throw new BadRequestError('El ID debe ser un número válido');
      }
      
      // Verificar que la orden existe
      const orden = await this.ordenEnvioRepository.findById(ordenId);
      if (!orden) {
        throw new NotFoundError(`No se encontró la orden de envío con ID ${id}`);
      }
      
      // Verificar que la orden pertenezca al usuario autenticado o que sea un admin/transportista
      if (orden.id_usuario !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'transportista') {
        throw new UnauthorizedError('No tiene permisos para ver esta orden de envío');
      }
      
      // Obtener notificaciones recientes de Redis
      const notificacionesRecientes = await this.envioNotificacionService.getNotificacionesRecientes(ordenId);
      
      // Responder con las notificaciones
      res.status(200).json({
        status: 'success',
        data: {
          orden_id: ordenId,
          guia: orden.guia,
          historial_reciente: notificacionesRecientes
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 