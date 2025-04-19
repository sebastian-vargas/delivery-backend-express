import { Router } from 'express';
import { ReporteController } from '../../../adapters/controllers/reporte.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Crear instancia del controlador
const reporteController = new ReporteController();

// Crear router
const router = Router();

// Definir rutas para reportes (todas requieren autenticación y permisos de administrador)
router.get('/envios', authenticate, authorize(['admin']), (req, res) => 
  reporteController.obtenerReporteEnvios(req, res)
);

router.get('/metricas', authenticate, authorize(['admin']), (req, res) => 
  reporteController.obtenerMetricas(req, res)
);

router.get('/metricas-transportistas', authenticate, authorize(['admin']), (req, res) => 
  reporteController.obtenerMetricasPorTransportista(req, res)
);

router.get('/envios-periodo', authenticate, authorize(['admin']), (req, res) => 
  reporteController.obtenerEnviosPorPeriodo(req, res)
);

export default router; 