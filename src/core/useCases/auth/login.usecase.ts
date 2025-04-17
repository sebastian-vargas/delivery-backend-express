import { IUsuarioRepository, IRoleRepository } from '../../repositories/usuario.repository.interface';
import { comparePassword } from '../../../frameworks/security/password';
import { generateToken } from '../../../frameworks/security/jwt';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    role: string;
  };
}

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository,
    private roleRepository:IRoleRepository
  ) {}

  async execute(credentials: LoginDTO): Promise<LoginResponseDTO> {
    const { email, password } = credentials;

    // Buscar el usuario por email
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar la contraseña
    const isPasswordValid = await comparePassword(password, usuario.contrasena);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Validar que el usuario tenga id
    if (!usuario.id) {
      throw new Error('Error en la información del usuario');
    }
    
    const role = await this.roleRepository.findById(usuario.id_rol);
    if (!role) {
      throw new Error('Error obteniendo el rol del usuario');
    }

    // Generar token JWT
    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      role: role.nombre
    });

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: role.nombre
      }
    };
  }
} 