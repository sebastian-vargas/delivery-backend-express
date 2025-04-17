import { Application } from 'express';
import authRoutes from './auth.routes';

export const setupRoutes = (app: Application): void => {
  // API versioning
  app.use('/api/v1/auth', authRoutes);
  
  // Ruta base para verificar que el servidor está funcionando
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Servicio de Logistics API funcionando correctamente'
    });
  });
}; 