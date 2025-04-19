import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from "../../frameworks/web/errors/http-errors";
import { ParametroRequeridoError } from '../../core/errors/domain-errors';
import { AsignarEnvioUseCase } from '../../core/useCases/logistica/asignarEnvio.usecase';
import { RutaRepository, TransportistaRepository } from '../repositories/logistica.reposiroty';

export class LogisticaController {
    private rutaRepository: RutaRepository;
    private transportistaRepository: TransportistaRepository;

    constructor(
        private asignarEnvioUseCase:AsignarEnvioUseCase
    ) {
        this.rutaRepository = new RutaRepository();
        this.transportistaRepository = new TransportistaRepository();
    }

    async asignarEnvio(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user || !req.user.userId) {
                throw new UnauthorizedError('Debe estar autenticado para crear órdenes de envío');
            }

            const { id_orden_envio, id_ruta, id_transportista } = req.body;

            // Validaciones básicas
            if (!id_orden_envio) {
                throw new ParametroRequeridoError('id_orden_envio');
            }
            
            if (!id_ruta) {
                throw new ParametroRequeridoError('id_ruta');
            }
            
            if (!id_transportista) {
                throw new ParametroRequeridoError('id_transportista');
            }

            // Crear la orden de envío
            const resultado = await this.asignarEnvioUseCase.execute({
                id_orden_envio,
                id_ruta,
                id_transportista
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

    /**
     * Obtiene todas las rutas disponibles
     */
    public async obtenerRutas(req: Request, res: Response): Promise<void> {
        try {
            const { page = '1', limit = '10' } = req.query;
            
            const rutas = await this.rutaRepository.findAll(
                parseInt(page as string, 10),
                parseInt(limit as string, 10)
            );
            
            res.status(200).json({
                status: 'success',
                data: rutas
            });
        } catch (error) {
            console.error('Error al obtener rutas:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener las rutas',
                error: (error as Error).message
            });
        }
    }

    /**
     * Obtiene todos los transportistas disponibles
     */
    public async obtenerTransportistas(req: Request, res: Response): Promise<void> {
        try {
            const { page = '1', limit = '10' } = req.query;
            
            const transportistas = await this.transportistaRepository.findAll(
                parseInt(page as string, 10),
                parseInt(limit as string, 10)
            );
            
            res.status(200).json({
                status: 'success',
                data: transportistas
            });
        } catch (error) {
            console.error('Error al obtener transportistas:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error al obtener los transportistas',
                error: (error as Error).message
            });
        }
    }
}