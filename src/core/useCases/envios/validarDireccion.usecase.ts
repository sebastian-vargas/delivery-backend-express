import { DireccionService } from '../../../frameworks/services/direccion.service';
import { DireccionInvalidaError, ParametroRequeridoError } from '../../errors/domain-errors';

export interface ValidarDireccionDTO {
  calle: string;
  ciudad: string;
  departamento?: string;
  codigo_postal?: string;
}

export interface ValidarDireccionResponseDTO {
  valida: boolean;
  mensaje: string;
  sugerencias?: string[];
}

export class ValidarDireccionUseCase {
  constructor(private direccionService: DireccionService) {}
  
  async execute(data: ValidarDireccionDTO): Promise<ValidarDireccionResponseDTO> {
    // Validaciones básicas
    if (!data.calle || data.calle.trim() === '') {
      throw new ParametroRequeridoError('calle');
    }
    
    if (!data.ciudad || data.ciudad.trim() === '') {
      throw new ParametroRequeridoError('ciudad');
    }
    
    // Llamar al servicio de validación de direcciones
    const resultado = await this.direccionService.validarDireccion(
      data.calle,
      data.ciudad,
      data.departamento,
      data.codigo_postal
    );
    
    // Si la dirección no es válida, lanzar un error
    if (!resultado.esValida) {
      throw new DireccionInvalidaError(resultado.mensaje || 'Dirección inválida');
    }
    
    // Devolver resultado válido
    return {
      valida: true,
      mensaje: resultado.mensaje || 'Dirección válida',
      sugerencias: resultado.sugerencias
    };
  }
} 