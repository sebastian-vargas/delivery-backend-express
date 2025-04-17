/**
 * Errores de dominio para la aplicación
 * Estos errores representan problemas relacionados con las reglas de negocio
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    // Necesario para que instanceof funcione correctamente con clases que extienden Error
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class DireccionInvalidaError extends DomainError {
  constructor(message = 'La dirección proporcionada no es válida') {
    super(message);
    this.name = 'DireccionInvalidaError';
    Object.setPrototypeOf(this, DireccionInvalidaError.prototype);
  }
}

export class ParametroRequeridoError extends DomainError {
  constructor(parametro: string) {
    super(`El parámetro '${parametro}' es requerido`);
    this.name = 'ParametroRequeridoError';
    Object.setPrototypeOf(this, ParametroRequeridoError.prototype);
  }
}

export class OperacionNoPermitidaError extends DomainError {
  constructor(message = 'Operación no permitida') {
    super(message);
    this.name = 'OperacionNoPermitidaError';
    Object.setPrototypeOf(this, OperacionNoPermitidaError.prototype);
  }
} 