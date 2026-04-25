import { Player } from '../../domain/entities/Player';
import { Move } from '../../domain/entities/Move';

export type ReplayDTO = {
  id: string;
  size: number;
  winner: Player | null;
  moves: Move[];
  isSinglePlayer: boolean;
  createdAt: string; // ISO 8601
};

export type CreateReplayDTO = {
  size: number;
  winner: Player | null;
  moves: Move[];
  isSinglePlayer: boolean;
};
