import { createReplay } from '../../domain/entities/Replay';
import { ReplayRepository } from '../ports/ReplayRepository';
import { CreateReplayDTO, ReplayDTO } from '../dto/ReplayDTO';

export class SaveReplayUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(dto: CreateReplayDTO): Promise<ReplayDTO> {
    const replayData = createReplay(dto);
    const saved = await this.repo.save(replayData);

    return {
      id: saved.id!,
      size: saved.size,
      winner: saved.winner,
      moves: saved.moves,
      isSinglePlayer: saved.isSinglePlayer,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
