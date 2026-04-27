import bcrypt from 'bcryptjs';
import { UserRepository } from '../ports/UserRepository';
import { UserAlreadyExistsError } from '../../domain/errors/AuthError';
import { User } from '../../domain/entities/User';

export class RegisterUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(username: string, email: string, password: string): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new UserAlreadyExistsError();

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.repo.save({ username, email, passwordHash, createdAt: new Date() });

    return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
  }
}
