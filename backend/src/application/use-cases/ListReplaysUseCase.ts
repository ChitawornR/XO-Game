import { ReplayRepository } from '../ports/ReplayRepository';
import { ReplayDTO } from '../dto/ReplayDTO';

export class ListReplaysUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(): Promise<ReplayDTO[]> {
    const replays = await this.repo.findAll();

    return replays.map((r) => ({
      id: r.id!,
      size: r.size,
      winner: r.winner,
      moves: r.moves,
      isSinglePlayer: r.isSinglePlayer,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
