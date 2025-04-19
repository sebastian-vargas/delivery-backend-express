import { AsignacionEnvio, Ruta, Transportista, Vehiculo } from "../../core/entities/logistica.entity";
import { IAsignacionEnvioRepository, IRutaRepository, ITransportistaRepository, IVehiculoRepository } from "../../core/repositories/logistica.repository.interface";
import { query } from '../../frameworks/database/mysql.connection';

export class AsignacionEnvioRepository implements IAsignacionEnvioRepository {
    async create(asignacion: AsignacionEnvio): Promise<AsignacionEnvio> {
        try {
            const result = await query<{ insertId: number }>(
                'INSERT INTO asignaciones_envio (id_orden_envio, id_ruta, id_transportista) VALUES (?, ?, ?)',
                [asignacion.id_orden_envio, asignacion.id_ruta, asignacion.id_transportista]
            );

            return { ...asignacion, id: result.insertId };
        } catch (error) {
            console.error('Error en create de AsignacionEnvioRepository:', error);
            throw error;
        }
    }
}

export class RutaRepository implements IRutaRepository {
    async findAll(page: number = 1, limit: number = 10): Promise<Ruta[]> {
        try {
            const offset = (page - 1) * limit;
            
            const rutas = await query<Ruta[]>(
                `SELECT * FROM rutas ORDER BY nombre_ruta ASC LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}`,
                []
            );

            return rutas;
        } catch (error) {
            console.error('Error en findAll de RutaRepository:', error);
            throw error;
        }
    }
}

export class TransportistaRepository implements ITransportistaRepository {
    async findById(id: number): Promise<Transportista | null> {
        try {
            const transportistas = await query<Transportista[]>(
                'SELECT * FROM transportistas WHERE id = ?',
                [id]
            );

            return transportistas.length > 0 ? transportistas[0] : null;
        } catch (error) {
            console.error('Error en findById de TransportistaRepository:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10): Promise<Transportista[]> {
        try {
            const offset = (page - 1) * limit;

            const transportistas = await query<Transportista[]>(
                `SELECT t.*, 
                   u.nombre AS nombre_usuario, 
                   v.tipo AS tipo_vehiculo, 
                   v.placa AS placa_vehiculo
                 FROM transportistas t
                 JOIN usuarios u ON t.id_usuario = u.id
                 JOIN vehiculos v ON t.id_vehiculo = v.id
                 ORDER BY t.id ASC LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}`,
                []
            );

            return transportistas;
        } catch (error) {
            console.error('Error en findAll de TransportistaRepository:', error);
            throw error;
        }
    }
}

export class VehiculoRepository implements IVehiculoRepository {
    async findById(id: number): Promise<Vehiculo | null> {
        try {
            const vehiculos = await query<Vehiculo[]>(
                'SELECT * FROM vehiculos WHERE id = ?',
                [id]
            );

            return vehiculos.length > 0 ? vehiculos[0] : null;
        } catch (error) {
            console.error('Error en findById de VehiculoRepository:', error);
            throw error;
        }
    }

    async findAll(page: number = 1, limit: number = 10): Promise<Vehiculo[]> {
        try {
            const offset = (page - 1) * limit;

            const vehiculos = await query<Vehiculo[]>(
                `SELECT * FROM vehiculos ORDER BY id ASC LIMIT ${parseInt(String(limit))} OFFSET ${parseInt(String(offset))}`,
                []
            );

            return vehiculos;
        } catch (error) {
            console.error('Error en findAll de VehiculoRepository:', error);
            throw error;
        }
    }
}