import { DomainError } from './domain-errors';

/**
 * Errores específicos relacionados con autenticación y usuarios
 */

export class AuthenticationError extends DomainError {
  constructor(message = 'Credenciales inválidas') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class UserExistsError extends DomainError {
  constructor(message = 'El usuario ya existe') {
    super(message);
    this.name = 'UserExistsError';
    Object.setPrototypeOf(this, UserExistsError.prototype);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Email o contraseña incorrectos') {
    super(message);
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class EmailRegisteredError extends UserExistsError {
  constructor() {
    super('El email ya está registrado');
    this.name = 'EmailRegisteredError';
    Object.setPrototypeOf(this, EmailRegisteredError.prototype);
  }
}

export class CedulaRegisteredError extends UserExistsError {
  constructor() {
    super('La cédula ya está registrada');
    this.name = 'CedulaRegisteredError';
    Object.setPrototypeOf(this, CedulaRegisteredError.prototype);
  }
} 