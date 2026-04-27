import { Player } from '../../domain/entities/Player';

export type MoveDTO = {
  row: number;
  col: number;
  player: Player;
  /** ISO 8601 — present on replays saved by v1.2.0+ clients */
  at?: string;
};

export type ReplayDTO = {
  id: string;
  size: number;
  winner: Player | null;
  moves: MoveDTO[];
  isSinglePlayer: boolean;
  createdAt: string; // ISO 8601
};

/** Input received from the HTTP boundary (zod-validated). */
export type CreateReplayDTO = {
  size: number;
  winner: Player | null;
  moves: MoveDTO[];
  isSinglePlayer: boolean;
};
