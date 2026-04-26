import { ReplayRepository } from '../ports/ReplayRepository';
import { DomainError } from '../../domain/errors/DomainError';

export class DeleteReplayUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new DomainError('Replay id must not be empty.');
    }

    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new DomainError(`Replay with id "${id}" not found.`);
    }
  }
}
