import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../core/useCases/auth/login.usecase';
import { RegisterUseCase } from '../../core/useCases/auth/register.usecase';
import { BadRequestError } from '../../frameworks/web/errors/http-errors';
import { ParametroRequeridoError } from '../../core/errors/domain-errors';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email) {
        throw new ParametroRequeridoError('email');
      }
      
      if (!password) {
        throw new ParametroRequeridoError('password');
      }

      const result = await this.loginUseCase.execute({ email, password });

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nombre, cedula, telefono, email, password } = req.body;

      // Validaciones básicas
      if (!nombre) {
        throw new ParametroRequeridoError('nombre');
      }
      
      if (!cedula) {
        throw new ParametroRequeridoError('cedula');
      }
      
      if (!telefono) {
        throw new ParametroRequeridoError('telefono');
      }
      
      if (!email) {
        throw new ParametroRequeridoError('email');
      }
      
      if (!password) {
        throw new ParametroRequeridoError('password');
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
      next(error);
    }
  }
} 