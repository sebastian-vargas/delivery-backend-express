export interface Usuario {
  id?: number;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  contrasena: string;
  id_rol: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Role {
  id?: number;
  nombre: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Permiso {
  id?: number;
  nombre: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RolPermiso {
  id?: number;
  id_rol: number;
  id_permiso: number;
  created_at?: Date;
  updated_at?: Date;
} 