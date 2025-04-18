import { Router } from 'express';
import { EnvioController } from '../../../adapters/controllers/envio.controller';
import { CrearOrdenEnvioUseCase } from '../../../core/useCases/envios/crearOrden.usecase';
import { ValidarDireccionUseCase } from '../../../core/useCases/envios/validarDireccion.usecase';
import { ActualizarEstadoOrdenUseCase } from '../../../core/useCases/envios/actualizarEstadoOrden.usecase';
import { NotificarCreacionOrdenUseCase } from '../../../core/useCases/envios/notificarCreacionOrden.usecase';
import { OrdenEnvioRepository, PaqueteRepository, DireccionDestinoRepository, EstadoEnvioRepository, HistorialEstadoRepository } from '../../../adapters/repositories/envio.repository';
import { UsuarioRepository } from '../../../adapters/repositories/usuario.repository';
import { DireccionService } from '../../../frameworks/services/direccion.service';
import { NotificacionService } from '../../../frameworks/services/notificacion.service';
import envioNotificacionService from '../../../frameworks/services/envio-notificacion.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';

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
const actualizarEstadoOrdenUseCase = new ActualizarEstadoOrdenUseCase(
  ordenEnvioRepository,
  estadoEnvioRepository,
  historialEstadoRepository,
  envioNotificacionService
);

// Crear instancia del controlador
const envioController = new EnvioController(
  crearOrdenEnvioUseCase,
  validarDireccionUseCase,
  actualizarEstadoOrdenUseCase,
  ordenEnvioRepository,
  paqueteRepository,
  direccionDestinoRepository,
  historialEstadoRepository,
  envioNotificacionService
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

// Ruta para actualizar el estado de un envío (requiere autenticación)
router.put('/:id/estado', authenticate, authorize(['admin','transportista']), (req, res, next) => envioController.actualizarEstadoOrden(req, res, next));

// Ruta para obtener el historial de cambios recientes desde Redis (requiere autenticación)
// Implementada la estrategia "cache-aside": primero verifica en Redis, si no encuentra datos consulta la base de datos y actualiza la caché.
router.get('/:id/historial-reciente', authenticate, (req, res, next) => envioController.obtenerHistorialCambiosRecientes(req, res, next));

// Ruta para obtener un envío específico por ID (requiere autenticación)
router.get('/id/:id', authenticate, (req, res, next) => envioController.obtenerEnvioPorId(req, res, next));

// Ruta para obtener un envío específico por guía (requiere autenticación)
router.get('/guia/:guia', authenticate, (req, res, next) => envioController.obtenerEnvioPorGuia(req, res, next));

router.get('/estado/:estado', authenticate, authorize(['admin']), (req, res, next) => envioController.obtenerOrdenesPorEstado(req, res, next));

export default router;