import { IUsuarioRepository, IRoleRepository } from '../../repositories/usuario.repository.interface';
import { comparePassword } from '../../../frameworks/security/password';
import { generateToken } from '../../../frameworks/security/jwt';
import { InvalidCredentialsError } from '../../errors/auth-errors';
import { DomainError } from '../../errors/domain-errors';

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
      throw new InvalidCredentialsError();
    }

    // Verificar la contraseña
    const isPasswordValid = await comparePassword(password, usuario.contrasena);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Validar que el usuario tenga id
    if (!usuario.id) {
      throw new DomainError('Error en la información del usuario');
    }
    
    const role = await this.roleRepository.findById(usuario.id_rol);
    if (!role) {
      throw new DomainError('Error obteniendo el rol del usuario');
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