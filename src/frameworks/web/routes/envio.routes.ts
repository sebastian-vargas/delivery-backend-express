import { Router } from 'express';
import { EnvioController } from '../../../adapters/controllers/envio.controller';
import { CrearOrdenEnvioUseCase } from '../../../core/useCases/envios/crearOrden.usecase';
import { ValidarDireccionUseCase } from '../../../core/useCases/envios/validarDireccion.usecase';
import { NotificarCreacionOrdenUseCase } from '../../../core/useCases/envios/notificarCreacionOrden.usecase';
import { OrdenEnvioRepository, PaqueteRepository, DireccionDestinoRepository, EstadoEnvioRepository, HistorialEstadoRepository } from '../../../adapters/repositories/envio.repository';
import { UsuarioRepository } from '../../../adapters/repositories/usuario.repository';
import { DireccionService } from '../../../frameworks/services/direccion.service';
import { NotificacionService } from '../../../frameworks/services/notificacion.service';
import { authenticate } from '../middlewares/auth.middleware';

// Crear instancias de servicios
const direccionService = new DireccionService();
const notificacionService = new NotificacionService();

// Crear instancias de repositorios
const ordenEnvioRepository = new OrdenEnvioRepository();
const paqueteRepository = new PaqueteRepository();
const direccionDestinoRepository = new DireccionDestinoRepository();
const estadoEnvioRepository = new EstadoEnvioRepository();
const historialEstadoRepository = new HistorialEstadoRepository();
const usuarioRepository = new UsuarioRepository();

// Crear instancias de casos de uso
const validarDireccionUseCase = new ValidarDireccionUseCase(direccionService);
const notificarCreacionOrdenUseCase = new NotificarCreacionOrdenUseCase(
  notificacionService,
  usuarioRepository
);
const crearOrdenEnvioUseCase = new CrearOrdenEnvioUseCase(
  ordenEnvioRepository,
  paqueteRepository,
  direccionDestinoRepository,
  estadoEnvioRepository,
  historialEstadoRepository,
  validarDireccionUseCase,
  notificarCreacionOrdenUseCase
);

// Crear instancia del controlador
const envioController = new EnvioController(
  crearOrdenEnvioUseCase,
  validarDireccionUseCase
);

// Crear router
const router = Router();

// Definir rutas
// Ruta para crear una orden de envío (requiere autenticación)
router.post('/', authenticate, (req, res, next) => envioController.crearOrden(req, res, next));

// Ruta para validar una dirección (no requiere autenticación)
router.post('/validar-direccion', (req, res, next) => envioController.validarDireccion(req, res, next));

// Ruta para obtener los envíos de un usuario (requiere autenticación)
router.get('/mis-envios', authenticate, (req, res, next) => envioController.listarEnviosUsuario(req, res, next));

// Ruta para obtener un envío específico (requiere autenticación)
router.get('/:id', authenticate, (req, res, next) => envioController.obtenerEnvioPorId(req, res, next));

export default router;