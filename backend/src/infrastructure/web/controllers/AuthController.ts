import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../../../application/use-cases/LoginUseCase';

export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
  ) {}

  handleRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password } = req.body as { username: string; email: string; password: string };
      const user = await this.register.execute(username, email, password);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  handleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const token = await this.login.execute(email, password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  };
}
