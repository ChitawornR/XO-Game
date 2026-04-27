import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/UserRepository';
import { UserModel } from './UserSchema';

export class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async save(user: Omit<User, 'id'>): Promise<User> {
    const doc = await UserModel.create(user);
    return this.toEntity(doc);
  }

  private toEntity(doc: InstanceType<typeof UserModel>): User {
    return {
      id: (doc._id as { toString(): string }).toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt,
    };
  }
}
