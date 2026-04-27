import { User } from '../../domain/entities/User';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: Omit<User, 'id'>): Promise<User>;
}
