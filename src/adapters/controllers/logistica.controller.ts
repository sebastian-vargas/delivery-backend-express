import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from "../../frameworks/web/errors/http-errors";
import { ParametroRequeridoError } from '../../core/errors/domain-errors';
import { AsignarEnvioUseCase } from '../../core/useCases/logistica/asignarEnvio.usecase';

export class LogisticaController {
    constructor(
        private asignarEnvioUseCase:AsignarEnvioUseCase
    ){}
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
}