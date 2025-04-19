import { Router } from 'express';
import { LogisticaController } from '../../../adapters/controllers/logistica.controller';
import { AsignarEnvioUseCase } from '../../../core/useCases/logistica/asignarEnvio.usecase';
import { AsignacionEnvioRepository, TransportistaRepository, VehiculoRepository } from '../../../adapters/repositories/logistica.reposiroty';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { EstadoEnvioRepository, HistorialEstadoRepository, OrdenEnvioRepository } from '../../../adapters/repositories/envio.repository';
import { EnvioNotificacionService } from '../../services/envio-notificacion.service';

// Crear instancias de repositorios
const ordenEnvioRepository = new OrdenEnvioRepository();
const estadoEnvioRepository = new EstadoEnvioRepository();
const historialEstadoRepository = new HistorialEstadoRepository();
const asignacionEnvioRepository = new AsignacionEnvioRepository();
const transportistaRepository = new TransportistaRepository();
const vehiculoRepository = new VehiculoRepository();
const envioNotificacionService = new EnvioNotificacionService();

// Crear instancias de casos de uso
const asignarEnvioUseCase = new AsignarEnvioUseCase(
  asignacionEnvioRepository,
  transportistaRepository,
  vehiculoRepository,
  ordenEnvioRepository,
  estadoEnvioRepository,
  historialEstadoRepository,
  envioNotificacionService
);

// Crear instancia del controlador
const logisticaController = new LogisticaController(
  asignarEnvioUseCase
);

// Crear router
const router = Router();

// Definir rutas
router.post('/asignar', authenticate, authorize(['admin']), (req, res, next) => 
  logisticaController.asignarEnvio(req, res, next)
);

// Ruta para obtener rutas
router.get('/rutas', (req, res) => 
  logisticaController.obtenerRutas(req, res)
);

// Ruta para obtener transportistas
router.get('/transportistas', authenticate, authorize(['admin']), (req, res) => 
  logisticaController.obtenerTransportistas(req, res)
);

export default router; 