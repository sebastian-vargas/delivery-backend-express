import { Request, Response } from 'express';
import { LoginUseCase } from '../../core/useCases/auth/login.usecase';
import { RegisterUseCase } from '../../core/useCases/auth/register.usecase';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar email y contraseña'
        });
        return;
      }

      const result = await this.loginUseCase.execute({ email, password });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      let message = 'Error en la autenticación';
      if (error instanceof Error) {
        message = error.message;
      }
      
      res.status(401).json({
        status: 'error',
        message
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, cedula, telefono, email, password } = req.body;

      // Validaciones básicas
      if (!nombre || !cedula || !telefono || !email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Todos los campos son obligatorios'
        });
        return;
      }

      const result = await this.registerUseCase.execute({
        nombre,
        cedula,
        telefono,
        email,
        password
      });

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      let message = 'Error en el registro';
      let statusCode = 500;
      
      if (error instanceof Error) {
        message = error.message;
        if (
          message.includes('ya está registrado') || 
          message.includes('ya está registrada')
        ) {
          statusCode = 409; // Conflict
        }
      }
      
      res.status(statusCode).json({
        status: 'error',
        message
      });
    }
  }
} 