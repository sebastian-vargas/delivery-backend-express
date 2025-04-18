import {
  IOrdenEnvioRepository,
  IPaqueteRepository,
  IDireccionDestinoRepository,
  IEstadoEnvioRepository,
  IHistorialEstadoRepository
} from '../../core/repositories/envio.repository.interface';
import {
  OrdenEnvio,
  Paquete,
  DireccionDestino,
  EstadoEnvio,
  HistorialEstado
} from '../../core/entities/envio.entity';
import { query } from '../../frameworks/database/mysql.connection';

export class OrdenEnvioRepository implements IOrdenEnvioRepository {
  async findById(id: number): Promise<OrdenEnvio | null> {
    try {
      const ordenes = await query<OrdenEnvio[]>(
        'SELECT * FROM ordenes_envio WHERE id = ?',
        [id]
      );
      
      return ordenes.length > 0 ? ordenes[0] : null;
    } catch (error) {
      console.error('Error en findById de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async findByUsuarioId(usuarioId: number, page: number = 1, limit: number = 10): Promise<OrdenEnvio[]> {
    try {
      const offset = (page - 1) * limit;
      
      const ordenes = await query<OrdenEnvio[]>(
        'SELECT * FROM ordenes_envio WHERE id_usuario = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [usuarioId, limit, offset]
      );
      
      return ordenes;
    } catch (error) {
      console.error('Error en findByUsuarioId de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async findByGuia(guia: string): Promise<OrdenEnvio | null> {
    try {
      const ordenes = await query<OrdenEnvio[]>(
        'SELECT * FROM ordenes_envio WHERE guia = ?',
        [guia]
      );
      
      return ordenes.length > 0 ? ordenes[0] : null;
    } catch (error) {
      console.error('Error en findByGuia de OrdenEnvioRepository:', error);
      throw error;
    }
  }

  async findByEstado(estado: string): Promise<OrdenEnvio[] | null> {
    try {
      const ordenes = await query<OrdenEnvio[]>(
        'SELECT * FROM ordenes_envio WHERE estado_actual = ?',
        [estado]
      );
      
      return ordenes.length > 0 ? ordenes : null;
    } catch (error) {
      console.error('Error en findByEstado de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async create(ordenEnvio: OrdenEnvio): Promise<OrdenEnvio> {
    try {
      // Generar una guía alfanumérica única de 11 caracteres
      const guia = this.generarGuiaUnica();
      
      const result = await query<{ insertId: number }>(
        'INSERT INTO ordenes_envio (guia, id_usuario, estado_actual) VALUES (?, ?, ?)',
        [guia, ordenEnvio.id_usuario, ordenEnvio.estado_actual]
      );
      
      return { ...ordenEnvio, id: result.insertId, guia };
    } catch (error) {
      console.error('Error en create de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  // Método privado para generar una guía alfanumérica única
  private generarGuiaUnica(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefijo = 'COO'; // Prefijo para Coordinadora
    let resultado = prefijo;
    
    // Generar 8 caracteres aleatorios (prefijo de 3 + 8 = 11 caracteres en total)
    for (let i = 0; i < 8; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return resultado;
  }
  
  async update(id: number, ordenEnvio: Partial<OrdenEnvio>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (ordenEnvio.estado_actual) {
        fields.push('estado_actual = ?');
        values.push(ordenEnvio.estado_actual);
      }
      
      if (ordenEnvio.fecha_entrega) {
        fields.push('fecha_entrega = ?');
        values.push(ordenEnvio.fecha_entrega);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id);
      
      const result = await query<{ affectedRows: number }>(
        `UPDATE ordenes_envio SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM ordenes_envio WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async findAll(page: number = 1, limit: number = 10): Promise<OrdenEnvio[]> {
    try {
      const offset = (page - 1) * limit;
      
      const ordenes = await query<OrdenEnvio[]>(
        'SELECT * FROM ordenes_envio ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return ordenes;
    } catch (error) {
      console.error('Error en findAll de OrdenEnvioRepository:', error);
      throw error;
    }
  }
  
  async countByEstado(estado: string): Promise<number> {
    try {
      const result = await query<[{ total: number }]>(
        'SELECT COUNT(*) as total FROM ordenes_envio WHERE estado_actual = ?',
        [estado]
      );
      
      return result[0].total;
    } catch (error) {
      console.error('Error en countByEstado de OrdenEnvioRepository:', error);
      throw error;
    }
  }
}

export class PaqueteRepository implements IPaqueteRepository {
  async findById(id: number): Promise<Paquete | null> {
    try {
      const paquetes = await query<Paquete[]>(
        'SELECT * FROM paquetes WHERE id = ?',
        [id]
      );
      
      return paquetes.length > 0 ? paquetes[0] : null;
    } catch (error) {
      console.error('Error en findById de PaqueteRepository:', error);
      throw error;
    }
  }
  
  async findByOrdenEnvioId(ordenEnvioId: number): Promise<Paquete[]> {
    try {
      const paquetes = await query<Paquete[]>(
        'SELECT * FROM paquetes WHERE id_orden_envio = ?',
        [ordenEnvioId]
      );
      
      return paquetes;
    } catch (error) {
      console.error('Error en findByOrdenEnvioId de PaqueteRepository:', error);
      throw error;
    }
  }
  
  async create(paquete: Paquete): Promise<Paquete> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO paquetes (id_orden_envio, tipo_envio, peso, largo, ancho, alto, tipo_producto) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [paquete.id_orden_envio, paquete.tipo_envio, paquete.peso, paquete.largo, paquete.ancho, paquete.alto, paquete.tipo_producto]
      );
      
      return { ...paquete, id: result.insertId };
    } catch (error) {
      console.error('Error en create de PaqueteRepository:', error);
      throw error;
    }
  }
  
  async update(id: number, paquete: Partial<Paquete>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (paquete.tipo_envio) {
        fields.push('tipo_envio = ?');
        values.push(paquete.tipo_envio);
      }
      
      if (paquete.peso) {
        fields.push('peso = ?');
        values.push(paquete.peso);
      }
      
      if (paquete.largo) {
        fields.push('largo = ?');
        values.push(paquete.largo);
      }
      
      if (paquete.ancho) {
        fields.push('ancho = ?');
        values.push(paquete.ancho);
      }
      
      if (paquete.alto) {
        fields.push('alto = ?');
        values.push(paquete.alto);
      }
      
      if (paquete.tipo_producto) {
        fields.push('tipo_producto = ?');
        values.push(paquete.tipo_producto);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id);
      
      const result = await query<{ affectedRows: number }>(
        `UPDATE paquetes SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de PaqueteRepository:', error);
      throw error;
    }
  }
  
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM paquetes WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de PaqueteRepository:', error);
      throw error;
    }
  }
}

export class DireccionDestinoRepository implements IDireccionDestinoRepository {
  async findById(id: number): Promise<DireccionDestino | null> {
    try {
      const direcciones = await query<DireccionDestino[]>(
        'SELECT * FROM direcciones_destino WHERE id = ?',
        [id]
      );
      
      return direcciones.length > 0 ? direcciones[0] : null;
    } catch (error) {
      console.error('Error en findById de DireccionDestinoRepository:', error);
      throw error;
    }
  }
  
  async findByOrdenEnvioId(ordenEnvioId: number): Promise<DireccionDestino | null> {
    try {
      const direcciones = await query<DireccionDestino[]>(
        'SELECT * FROM direcciones_destino WHERE id_orden_envio = ?',
        [ordenEnvioId]
      );
      
      return direcciones.length > 0 ? direcciones[0] : null;
    } catch (error) {
      console.error('Error en findByOrdenEnvioId de DireccionDestinoRepository:', error);
      throw error;
    }
  }
  
  async create(direccion: DireccionDestino): Promise<DireccionDestino> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO direcciones_destino (id_orden_envio, calle, ciudad, departamento, codigo_postal) VALUES (?, ?, ?, ?, ?)',
        [direccion.id_orden_envio, direccion.calle, direccion.ciudad, direccion.departamento, direccion.codigo_postal]
      );
      
      return { ...direccion, id: result.insertId };
    } catch (error) {
      console.error('Error en create de DireccionDestinoRepository:', error);
      throw error;
    }
  }
  
  async update(id: number, direccion: Partial<DireccionDestino>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (direccion.calle) {
        fields.push('calle = ?');
        values.push(direccion.calle);
      }
      
      if (direccion.ciudad) {
        fields.push('ciudad = ?');
        values.push(direccion.ciudad);
      }
      
      if (direccion.departamento) {
        fields.push('departamento = ?');
        values.push(direccion.departamento);
      }
      
      if (direccion.codigo_postal) {
        fields.push('codigo_postal = ?');
        values.push(direccion.codigo_postal);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id);
      
      const result = await query<{ affectedRows: number }>(
        `UPDATE direcciones_destino SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de DireccionDestinoRepository:', error);
      throw error;
    }
  }
  
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM direcciones_destino WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de DireccionDestinoRepository:', error);
      throw error;
    }
  }
}

export class EstadoEnvioRepository implements IEstadoEnvioRepository {
  async findById(id: number): Promise<EstadoEnvio | null> {
    try {
      const estados = await query<EstadoEnvio[]>(
        'SELECT * FROM estados_envio WHERE id = ?',
        [id]
      );
      
      return estados.length > 0 ? estados[0] : null;
    } catch (error) {
      console.error('Error en findById de EstadoEnvioRepository:', error);
      throw error;
    }
  }
  
  async findByNombre(nombre: string): Promise<EstadoEnvio | null> {
    try {
      const estados = await query<EstadoEnvio[]>(
        'SELECT * FROM estados_envio WHERE nombre_estado = ?',
        [nombre]
      );
      
      return estados.length > 0 ? estados[0] : null;
    } catch (error) {
      console.error('Error en findByNombre de EstadoEnvioRepository:', error);
      throw error;
    }
  }
  
  async create(estado: EstadoEnvio): Promise<EstadoEnvio> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO estados_envio (nombre_estado) VALUES (?)',
        [estado.nombre_estado]
      );
      
      return { ...estado, id: result.insertId };
    } catch (error) {
      console.error('Error en create de EstadoEnvioRepository:', error);
      throw error;
    }
  }
  
  async update(id: number, estado: Partial<EstadoEnvio>): Promise<boolean> {
    try {
      if (!estado.nombre_estado) {
        return false;
      }
      
      const result = await query<{ affectedRows: number }>(
        'UPDATE estados_envio SET nombre_estado = ? WHERE id = ?',
        [estado.nombre_estado, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de EstadoEnvioRepository:', error);
      throw error;
    }
  }
  
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM estados_envio WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de EstadoEnvioRepository:', error);
      throw error;
    }
  }
  
  async findAll(): Promise<EstadoEnvio[]> {
    try {
      const estados = await query<EstadoEnvio[]>('SELECT * FROM estados_envio');
      return estados;
    } catch (error) {
      console.error('Error en findAll de EstadoEnvioRepository:', error);
      throw error;
    }
  }
}

export class HistorialEstadoRepository implements IHistorialEstadoRepository {
  async findById(id: number): Promise<HistorialEstado | null> {
    try {
      const historiales = await query<HistorialEstado[]>(
        'SELECT * FROM historial_estados WHERE id = ?',
        [id]
      );
      
      return historiales.length > 0 ? historiales[0] : null;
    } catch (error) {
      console.error('Error en findById de HistorialEstadoRepository:', error);
      throw error;
    }
  }
  
  async findByOrdenEnvioId(ordenEnvioId: number): Promise<HistorialEstado[]> {
    try {
      const historiales = await query<HistorialEstado[]>(
        'SELECT h.*, e.nombre_estado FROM historial_estados h ' +
        'JOIN estados_envio e ON h.id_estado_envio = e.id ' +
        'WHERE h.id_orden_envio = ? ' +
        'ORDER BY h.fecha_hora DESC',
        [ordenEnvioId]
      );
      
      return historiales;
    } catch (error) {
      console.error('Error en findByOrdenEnvioId de HistorialEstadoRepository:', error);
      throw error;
    }
  }
  
  async create(historial: HistorialEstado): Promise<HistorialEstado> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO historial_estados (id_orden_envio, id_estado_envio, fecha_hora, observaciones) VALUES (?, ?, ?, ?)',
        [historial.id_orden_envio, historial.id_estado_envio, historial.fecha_hora, historial.observaciones]
      );
      
      return { ...historial, id: result.insertId };
    } catch (error) {
      console.error('Error en create de HistorialEstadoRepository:', error);
      throw error;
    }
  }
  
  async findUltimoEstado(ordenEnvioId: number): Promise<HistorialEstado | null> {
    try {
      const historiales = await query<HistorialEstado[]>(
        'SELECT h.*, e.nombre_estado FROM historial_estados h ' +
        'JOIN estados_envio e ON h.id_estado_envio = e.id ' +
        'WHERE h.id_orden_envio = ? ' +
        'ORDER BY h.fecha_hora DESC ' +
        'LIMIT 1',
        [ordenEnvioId]
      );
      
      return historiales.length > 0 ? historiales[0] : null;
    } catch (error) {
      console.error('Error en findUltimoEstado de HistorialEstadoRepository:', error);
      throw error;
    }
  }
} 