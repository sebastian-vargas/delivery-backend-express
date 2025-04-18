import { Request, Response, NextFunction } from 'express';
import { CrearOrdenEnvioUseCase } from '../../core/useCases/envios/crearOrden.usecase';
import { ValidarDireccionUseCase } from '../../core/useCases/envios/validarDireccion.usecase';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../../frameworks/web/errors/http-errors';
import { ParametroRequeridoError } from '../../core/errors/domain-errors';
import { 
  IOrdenEnvioRepository, 
  IPaqueteRepository,
  IDireccionDestinoRepository,
  IHistorialEstadoRepository 
} from '../../core/repositories/envio.repository.interface';

export class EnvioController {
  constructor(
    private crearOrdenEnvioUseCase: CrearOrdenEnvioUseCase,
    private validarDireccionUseCase: ValidarDireccionUseCase,
    private ordenEnvioRepository: IOrdenEnvioRepository,
    private paqueteRepository: IPaqueteRepository,
    private direccionDestinoRepository: IDireccionDestinoRepository,
    private historialEstadoRepository: IHistorialEstadoRepository
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
} 