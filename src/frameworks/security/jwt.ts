import jwt from 'jsonwebtoken';
import { config } from '../../config';

// Tipo para el payload
interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  [key: string]: any;
}

// Generar token
export const generateToken = (payload: TokenPayload): string => {
  // @ts-ignore
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Verificar token
export const verifyToken = (token: string): TokenPayload => {
  try {
    // @ts-ignore - Ignorar errores de tipo de TypeScript para la función jwt.verify
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
};

export default {
  generateToken,
  verifyToken
}; 