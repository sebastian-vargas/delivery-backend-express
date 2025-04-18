import { AsignacionEnvio, Transportista, Vehiculo } from "../../core/entities/logistica.entity";
import { IAsignacionEnvioRepository, ITransportistaRepository, IVehiculoRepository } from "../../core/repositories/logistica.repository.interface";
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

            const ordenes = await query<Transportista[]>(
                'SELECT * FROM transportistas ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );

            return ordenes;
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

            const ordenes = await query<Vehiculo[]>(
                'SELECT * FROM vehiculos ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );

            return ordenes;
        } catch (error) {
            console.error('Error en findAll de VehiculoRepository:', error);
            throw error;
        }
    }
}