import { Application } from 'express';
import authRoutes from './auth.routes';
import envioRoutes from './envio.routes';
import asignarRoutes from './asignar.routes';
import reporteRoutes from './reporte.routes';
import logisticaRoutes from './logistica.routes';

export const setupRoutes = (app: Application): void => {
  // API versioning
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/envios', envioRoutes);
  app.use('/api/v1/reportes', reporteRoutes);
  app.use('/api/v1/logistica', logisticaRoutes);
  
  // Ruta base para verificar que el servidor está funcionando
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Servicio de Logistics API funcionando correctamente'
    });
  });
}; 