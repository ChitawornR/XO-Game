import { ReplayRepository } from '../ports/ReplayRepository';
import { ReplayDTO } from '../dto/ReplayDTO';
import { DomainError } from '../../domain/errors/DomainError';

export class ReplayNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Replay with id "${id}" not found.`);
    this.name = 'ReplayNotFoundError';
  }
}

export class GetReplayByIdUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(id: string): Promise<ReplayDTO> {
    const r = await this.repo.findById(id);
    if (!r) throw new ReplayNotFoundError(id);

    return {
      id: r.id!,
      size: r.size,
      winner: r.winner,
      moves: r.moves,
      isSinglePlayer: r.isSinglePlayer,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
