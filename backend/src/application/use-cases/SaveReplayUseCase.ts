import { createReplay } from '../../domain/entities/Replay';
import { Move } from '../../domain/entities/Move';
import { ReplayRepository } from '../ports/ReplayRepository';
import { CreateReplayDTO, MoveDTO, ReplayDTO } from '../dto/ReplayDTO';

function toMoveDTO(m: Move): MoveDTO {
  return {
    row: m.row,
    col: m.col,
    player: m.player,
    at: m.at instanceof Date ? m.at.toISOString() : undefined,
  };
}

export class SaveReplayUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(dto: CreateReplayDTO): Promise<ReplayDTO> {
    const replayData = createReplay(dto);
    const saved = await this.repo.save({ ...replayData, userId: dto.userId });

    return {
      id: saved.id!,
      size: saved.size,
      winner: saved.winner,
      moves: saved.moves.map(toMoveDTO),
      isSinglePlayer: saved.isSinglePlayer,
      isOnline: saved.isOnline,
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
