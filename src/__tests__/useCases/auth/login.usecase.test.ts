import { LoginUseCase, LoginDTO } from '../../../core/useCases/auth/login.usecase';
import { InvalidCredentialsError } from '../../../core/errors/auth-errors';

// Mocks para dependencias
const mockUsuarioRepository = {
  findByEmail: jest.fn()
};

const mockRoleRepository = {
  findById: jest.fn()
};

// Mock para las funciones de seguridad
jest.mock('../../../frameworks/security/password', () => ({
  comparePassword: jest.fn()
}));

jest.mock('../../../frameworks/security/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token')
}));

// Importación de las funciones mockeadas
import { comparePassword } from '../../../frameworks/security/password';
import { generateToken } from '../../../frameworks/security/jwt';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  
  beforeEach(() => {
    jest.clearAllMocks();
    loginUseCase = new LoginUseCase(
      mockUsuarioRepository as any,
      mockRoleRepository as any
    );
  });

  test('debe autenticar correctamente y devolver token y datos de usuario', async () => {
    // Arrange
    const mockCredentials: LoginDTO = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const mockUsuario = {
      id: 1,
      email: 'test@example.com',
      nombre: 'Test User',
      contrasena: 'hashed_password',
      id_rol: 2
    };
    
    const mockRole = {
      id: 2,
      nombre: 'cliente'
    };

    // Configurar mocks
    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
    mockRoleRepository.findById.mockResolvedValue(mockRole);
    (comparePassword as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await loginUseCase.execute(mockCredentials);

    // Assert
    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(comparePassword).toHaveBeenCalledWith(mockCredentials.password, mockUsuario.contrasena);
    expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockUsuario.id_rol);
    expect(generateToken).toHaveBeenCalledWith({
      userId: mockUsuario.id,
      email: mockUsuario.email,
      role: mockRole.nombre
    });
    
    expect(result).toEqual({
      token: 'mock-token',
      user: {
        id: mockUsuario.id,
        nombre: mockUsuario.nombre,
        email: mockUsuario.email,
        role: mockRole.nombre
      }
    });
  });

  test('debe lanzar InvalidCredentialsError si el usuario no existe', async () => {
    // Arrange
    const mockCredentials: LoginDTO = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };
    
    mockUsuarioRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(loginUseCase.execute(mockCredentials))
      .rejects
      .toThrow(InvalidCredentialsError);
    
    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(comparePassword).not.toHaveBeenCalled();
  });

  test('debe lanzar InvalidCredentialsError si la contraseña es incorrecta', async () => {
    // Arrange
    const mockCredentials: LoginDTO = {
      email: 'test@example.com',
      password: 'wrong_password'
    };
    
    const mockUsuario = {
      id: 1,
      email: 'test@example.com',
      nombre: 'Test User',
      contrasena: 'hashed_password',
      id_rol: 2
    };
    
    mockUsuarioRepository.findByEmail.mockResolvedValue(mockUsuario);
    (comparePassword as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await expect(loginUseCase.execute(mockCredentials))
      .rejects
      .toThrow(InvalidCredentialsError);
    
    expect(mockUsuarioRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(comparePassword).toHaveBeenCalledWith(mockCredentials.password, mockUsuario.contrasena);
  });
}); 