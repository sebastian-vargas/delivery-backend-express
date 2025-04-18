import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import http from 'http';

import { config } from './config';
import { setupRoutes } from './frameworks/web/routes';
import { mapErrorToHttpResponse } from './frameworks/web/utils/error-mapper';
import socketService from './frameworks/web/socket/socket.service';
import { connectRedis } from './frameworks/database/redis.connection';

const app = express();
const server = http.createServer(app);

// Inicializar Redis (comentar estas líneas para deshabilitar Redis temporalmente)
/*
connectRedis()
  .then(() => console.log('Redis inicializado correctamente'))
  .catch(error => console.error('Error al inicializar Redis:', error));
*/

// Inicializar WebSockets
socketService.initialize(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configurar rutas
setupRoutes(app);

// Swagger UI
const swaggerDocument = require('../swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  const { statusCode, body } = mapErrorToHttpResponse(err);
  
  res.status(statusCode).json(body);
});

const PORT = config.port || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app; 