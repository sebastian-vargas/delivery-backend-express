import { IUsuarioRepository } from '../../repositories/usuario.repository.interface';
import { IRoleRepository } from '../../repositories/usuario.repository.interface';
import { Usuario } from '../../entities/usuario.entity';
import { hashPassword } from '../../../frameworks/security/password';
import { EmailRegisteredError, CedulaRegisteredError } from '../../errors/auth-errors';
import { DomainError } from '../../errors/domain-errors';

export interface RegisterDTO {
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  password: string;
}

export interface RegisterResponseDTO {
  id: number;
  nombre: string;
  email: string;
}

export class RegisterUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private roleRepository: IRoleRepository
  ) {}

  async execute(userData: RegisterDTO): Promise<RegisterResponseDTO> {
    const { email, cedula, password } = userData;

    // Verificar si el email ya está registrado
    const existingEmail = await this.usuarioRepository.findByEmail(email);
    if (existingEmail) {
      throw new EmailRegisteredError();
    }

    // Verificar si la cédula ya está registrada
    const existingCedula = await this.usuarioRepository.findByCedula(cedula);
    if (existingCedula) {
      throw new CedulaRegisteredError();
    }

    // Obtener el rol de usuario (por defecto, rol "usuario")
    const userRole = await this.roleRepository.findByNombre('usuario');
    if (!userRole || !userRole.id) {
      throw new DomainError('No se pudo encontrar el rol de usuario');
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el nuevo usuario
    const newUser: Usuario = {
      nombre: userData.nombre,
      cedula: userData.cedula,
      telefono: userData.telefono,
      email: userData.email,
      contrasena: hashedPassword,
      id_rol: userRole.id
    };

    // Guardar el usuario
    const createdUser = await this.usuarioRepository.create(newUser);

    // Verificar que el usuario tenga ID
    if (!createdUser.id) {
      throw new DomainError('Error al crear el usuario');
    }

    return {
      id: createdUser.id,
      nombre: createdUser.nombre,
      email: createdUser.email
    };
  }
} 