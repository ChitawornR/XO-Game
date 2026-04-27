import { ReplayRepository } from '../ports/ReplayRepository';
import { Move } from '../../domain/entities/Move';
import { MoveDTO, ReplayDTO } from '../dto/ReplayDTO';

function toMoveDTO(m: Move): MoveDTO {
  return {
    row: m.row,
    col: m.col,
    player: m.player,
    at: m.at instanceof Date ? m.at.toISOString() : undefined,
  };
}

export class ListReplaysUseCase {
  constructor(private readonly repo: ReplayRepository) {}

  async execute(): Promise<ReplayDTO[]> {
    const replays = await this.repo.findAll();

    return replays.map((r) => ({
      id: r.id!,
      size: r.size,
      winner: r.winner,
      moves: r.moves.map(toMoveDTO),
      isSinglePlayer: r.isSinglePlayer,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
