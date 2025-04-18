import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { AsignacionEnvioRepository, TransportistaRepository, VehiculoRepository } from "../../../adapters/repositories/logistica.reposiroty";
import { AsignarEnvioUseCase } from "../../../core/useCases/logistica/asignarEnvio.usecase";
import { LogisticaController } from '../../../adapters/controllers/logistica.controller';
import { OrdenEnvioRepository } from '../../../adapters/repositories/envio.repository';


// Crear instancias de repositorios
const asignacionEnvioRepository = new AsignacionEnvioRepository();
const transportistaRepository = new TransportistaRepository();
const vehiculoRepository = new VehiculoRepository();

const asignarEnvioUseCase = new AsignarEnvioUseCase(
    asignacionEnvioRepository,
    transportistaRepository,
    vehiculoRepository
);

// Crear instancia del controlador
const logisticaController = new LogisticaController(
    asignarEnvioUseCase
);

// Crear router
const router = Router();

// Definir rutas
// Ruta para asignar una orden de envio a una ruta y transportista (requiere autenticación)
router.post('/', authenticate, (req, res, next) => logisticaController.asignarEnvio(req, res, next));
export default router;