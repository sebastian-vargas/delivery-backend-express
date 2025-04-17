import { Router } from 'express';
import { AuthController } from '../../../adapters/controllers/auth.controller';
import { LoginUseCase } from '../../../core/useCases/auth/login.usecase';
import { RegisterUseCase } from '../../../core/useCases/auth/register.usecase';
import { UsuarioRepository, RoleRepository } from '../../../adapters/repositories/usuario.repository';

// Crear instancias de repositorios
const usuarioRepository = new UsuarioRepository();
const roleRepository = new RoleRepository();

// Crear instancias de casos de uso
const loginUseCase = new LoginUseCase(usuarioRepository, roleRepository);
const registerUseCase = new RegisterUseCase(usuarioRepository, roleRepository);

// Crear instancia del controlador
const authController = new AuthController(loginUseCase, registerUseCase);

// Crear router
const router = Router();

// Definir rutas
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));

export default router; 