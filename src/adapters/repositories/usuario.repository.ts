import { 
  IUsuarioRepository, 
  IRoleRepository,
  IPermisoRepository,
  IRolPermisoRepository
} from '../../core/repositories/usuario.repository.interface';
import { Usuario, Role, Permiso, RolPermiso } from '../../core/entities/usuario.entity';
import { query } from '../../frameworks/database/mysql.connection';

export class UsuarioRepository implements IUsuarioRepository {
  
  async findById(id: number): Promise<Usuario | null> {
    try {
      const usuarios = await query<Usuario[]>(
        'SELECT * FROM usuarios WHERE id = ?',
        [id]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
    } catch (error) {
      console.error('Error en findById de UsuarioRepository:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const usuarios = await query<Usuario[]>(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
    } catch (error) {
      console.error('Error en findByEmail de UsuarioRepository:', error);
      throw error;
    }
  }

  async findByCedula(cedula: string): Promise<Usuario | null> {
    try {
      const usuarios = await query<Usuario[]>(
        'SELECT * FROM usuarios WHERE cedula = ?',
        [cedula]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
    } catch (error) {
      console.error('Error en findByCedula de UsuarioRepository:', error);
      throw error;
    }
  }

  async create(usuario: Usuario): Promise<Usuario> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO usuarios (nombre, cedula, telefono, email, contrasena, id_rol) VALUES (?, ?, ?, ?, ?, ?)',
        [usuario.nombre, usuario.cedula, usuario.telefono, usuario.email, usuario.contrasena, usuario.id_rol]
      );
      
      return { ...usuario, id: result.insertId };
    } catch (error) {
      console.error('Error en create de UsuarioRepository:', error);
      throw error;
    }
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (usuario.nombre) {
        fields.push('nombre = ?');
        values.push(usuario.nombre);
      }
      
      if (usuario.telefono) {
        fields.push('telefono = ?');
        values.push(usuario.telefono);
      }
      
      if (usuario.email) {
        fields.push('email = ?');
        values.push(usuario.email);
      }
      
      if (usuario.contrasena) {
        fields.push('contrasena = ?');
        values.push(usuario.contrasena);
      }
      
      if (usuario.id_rol) {
        fields.push('id_rol = ?');
        values.push(usuario.id_rol);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      values.push(id);
      
      const result = await query<{ affectedRows: number }>(
        `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de UsuarioRepository:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de UsuarioRepository:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Usuario[]> {
    try {
      const offset = (page - 1) * limit;
      
      const usuarios = await query<Usuario[]>(
        'SELECT * FROM usuarios LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      return usuarios;
    } catch (error) {
      console.error('Error en findAll de UsuarioRepository:', error);
      throw error;
    }
  }
}

export class RoleRepository implements IRoleRepository {
  
  async findById(id: number): Promise<Role | null> {
    try {
      const roles = await query<Role[]>(
        'SELECT * FROM roles WHERE id = ?',
        [id]
      );
      
      return roles.length > 0 ? roles[0] : null;
    } catch (error) {
      console.error('Error en findById de RoleRepository:', error);
      throw error;
    }
  }

  async findByNombre(nombre: string): Promise<Role | null> {
    try {
      const roles = await query<Role[]>(
        'SELECT * FROM roles WHERE nombre = ?',
        [nombre]
      );
      
      return roles.length > 0 ? roles[0] : null;
    } catch (error) {
      console.error('Error en findByNombre de RoleRepository:', error);
      throw error;
    }
  }

  async create(role: Role): Promise<Role> {
    try {
      const result = await query<{ insertId: number }>(
        'INSERT INTO roles (nombre) VALUES (?)',
        [role.nombre]
      );
      
      return { ...role, id: result.insertId };
    } catch (error) {
      console.error('Error en create de RoleRepository:', error);
      throw error;
    }
  }

  async update(id: number, role: Partial<Role>): Promise<boolean> {
    try {
      if (!role.nombre) {
        return false;
      }
      
      const result = await query<{ affectedRows: number }>(
        'UPDATE roles SET nombre = ? WHERE id = ?',
        [role.nombre, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update de RoleRepository:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM roles WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en delete de RoleRepository:', error);
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      const roles = await query<Role[]>('SELECT * FROM roles');
      return roles;
    } catch (error) {
      console.error('Error en findAll de RoleRepository:', error);
      throw error;
    }
  }
} 