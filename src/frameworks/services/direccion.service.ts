import axios from 'axios';
import { getCache, setCache } from '../database/redis.connection';

interface DireccionValidacion {
  esValida: boolean;
  mensaje?: string;
  sugerencias?: string[];
}

/**
 * Servicio para validar direcciones utilizando una API externa
 * Nota: Este es un servicio simulado que siempre retorna que la dirección es válida.
 * En un ambiente real, se debería integrar con una API como Google Maps, Geocode, etc.
 */
export class DireccionService {
  private readonly CACHE_TTL = 3600; // 1 hora en segundos
  
  /**
   * Valida una dirección utilizando una API externa
   * @param calle Calle y número
   * @param ciudad Ciudad
   * @param departamento Departamento o estado
   * @param codigoPostal Código postal
   * @returns Objeto con el resultado de la validación
   */
  async validarDireccion(
    calle: string,
    ciudad: string,
    departamento?: string,
    codigoPostal?: string
  ): Promise<DireccionValidacion> {
    try {
      // Crear una clave única para caché basada en los parámetros
      const cacheKey = `direccion_${this.normalizarTexto(calle)}_${this.normalizarTexto(ciudad)}_${this.normalizarTexto(departamento || '')}_${codigoPostal || ''}`;
      
      // Intentar obtener del caché
      const cachedResult = await getCache<DireccionValidacion>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
      
      // En un entorno real, aquí haríamos la llamada a la API
      // Por ejemplo:
      /*
      const response = await axios.get('https://api.direcciones.com/validar', {
        params: {
          calle,
          ciudad,
          departamento,
          codigoPostal
        }
      });
      
      const resultado: DireccionValidacion = {
        esValida: response.data.valida,
        mensaje: response.data.mensaje,
        sugerencias: response.data.sugerencias
      };
      */
      
      // Simulación de validación (siempre devuelve válido)
      const resultado: DireccionValidacion = {
        esValida: true,
        mensaje: 'Dirección validada con éxito'
      };
      
      // Guardar en caché para futuras consultas
      await setCache(cacheKey, resultado, this.CACHE_TTL);
      
      return resultado;
    } catch (error) {
      console.error('Error al validar dirección:', error);
      
      // En caso de error, asumimos que la dirección es válida para no interrumpir el flujo
      return {
        esValida: true,
        mensaje: 'No se pudo verificar la dirección, se asume como válida'
      };
    }
  }
  
  /**
   * Normaliza un texto para usarlo en claves de caché
   * Elimina acentos, convierte a minúsculas y reemplaza espacios por guiones
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
} 