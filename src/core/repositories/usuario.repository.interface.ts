import { Usuario, Role, Permiso, RolPermiso } from '../entities/usuario.entity';

export interface IUsuarioRepository {
  findById(id: number): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByCedula(cedula: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
  update(id: number, usuario: Partial<Usuario>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(page?: number, limit?: number): Promise<Usuario[]>;
}

export interface IRoleRepository {
  findById(id: number): Promise<Role | null>;
  findByNombre(nombre: string): Promise<Role | null>;
  create(role: Role): Promise<Role>;
  update(id: number, role: Partial<Role>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Role[]>;
}

export interface IPermisoRepository {
  findById(id: number): Promise<Permiso | null>;
  findByNombre(nombre: string): Promise<Permiso | null>;
  create(permiso: Permiso): Promise<Permiso>;
  update(id: number, permiso: Partial<Permiso>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Permiso[]>;
}

export interface IRolPermisoRepository {
  assignPermisoToRol(rolId: number, permisoId: number): Promise<boolean>;
  removePermisoFromRol(rolId: number, permisoId: number): Promise<boolean>;
  findPermisosByRolId(rolId: number): Promise<Permiso[]>;
} 