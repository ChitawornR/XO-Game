import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../ports/UserRepository';
import { InvalidCredentialsError } from '../../domain/errors/AuthError';
import { env } from '../../infrastructure/config/env';

export class LoginUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(email: string, password: string): Promise<string> {
    const user = await this.repo.findByEmail(email);
    if (!user) throw new InvalidCredentialsError();

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new InvalidCredentialsError();

    return jwt.sign({ sub: user.id, username: user.username }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
