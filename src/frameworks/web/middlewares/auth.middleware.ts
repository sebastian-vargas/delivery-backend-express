import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../security/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors/http-errors';

// Extender la interfaz de Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

// Middleware para proteger rutas
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No se proporcionó un token de autenticación');
    }
    
    // Extraer token
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar token
      const decoded = verifyToken(token);
      
      // Agregar los datos del usuario al objeto de la solicitud
      req.user = decoded;
      
      next();
    } catch (error) {
      // Capturar específicamente errores de verificación de token
      throw new UnauthorizedError('Token inválido o expirado');
    }
  } catch (error) {
    // Pasar todos los errores al middleware global
    next(error);
  }
};

// Middleware para comprobar roles
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('No autenticado');
      }
      
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('No autorizado para acceder a este recurso');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  authenticate,
  authorize
}; 