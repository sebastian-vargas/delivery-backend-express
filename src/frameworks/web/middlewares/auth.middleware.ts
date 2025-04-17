import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../security/jwt';

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
      return res.status(401).json({
        status: 'error',
        message: 'No se proporcionó un token de autenticación'
      });
    }
    
    // Extraer token
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = verifyToken(token);
    
    // Agregar los datos del usuario al objeto de la solicitud
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para comprobar roles
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'No autenticado'
        });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'No autorizado para acceder a este recurso'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al verificar los permisos'
      });
    }
  };
};

export default {
  authenticate,
  authorize
}; 