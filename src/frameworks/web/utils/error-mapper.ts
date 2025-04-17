import {
  DomainError,
  DireccionInvalidaError,
  ParametroRequeridoError,
  OperacionNoPermitidaError
} from '../../../core/errors/domain-errors';
import {
  AuthenticationError,
  UserExistsError,
  InvalidCredentialsError,
  EmailRegisteredError,
  CedulaRegisteredError
} from '../../../core/errors/auth-errors';
import { HttpError } from '../errors/http-errors';

/**
 * Mapea errores de dominio y otros a respuestas HTTP
 * @param error Error a mapear
 * @returns Objeto con código de estado y cuerpo de la respuesta
 */
export const mapErrorToHttpResponse = (error: Error): { statusCode: number; body: any } => {
  // Si ya es un HttpError, usar su código de estado
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }

  // Errores específicos de autenticación primero (clases derivadas)
  if (error instanceof InvalidCredentialsError) {
    return {
      statusCode: 401,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Errores específicos de usuario existente (clases derivadas)
  if (error instanceof EmailRegisteredError) {
    return {
      statusCode: 409, // Conflict
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  if (error instanceof CedulaRegisteredError) {
    return {
      statusCode: 409, // Conflict
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Errores de clases base después de las derivadas
  if (error instanceof AuthenticationError) {
    return {
      statusCode: 401,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  if (error instanceof UserExistsError) {
    return {
      statusCode: 409, // Conflict
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Mapeo de errores de dominio
  if (error instanceof DireccionInvalidaError) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  if (error instanceof ParametroRequeridoError) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  if (error instanceof OperacionNoPermitidaError) {
    return {
      statusCode: 403,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Para cualquier error de dominio no específico
  if (error instanceof DomainError) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Errores de token JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      body: {
        status: 'error',
        message: 'Token inválido o expirado'
      }
    };
  }
  
  // Capturar errores típicos de validación
  if (error.message && (
    error.message.includes('requerido') ||
    error.message.includes('inválido') ||
    error.message.includes('debe ser')
  )) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
  
  // Error por defecto (500 Internal Server Error)
  console.error('Error no manejado:', error);
  return {
    statusCode: 500,
    body: {
      status: 'error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : error.message || 'Error interno del servidor'
    }
  };
}; 