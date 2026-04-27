import { Player } from './Player';

export type Move = {
  row: number;
  col: number;
  player: Player;
  /** ISO 8601 timestamp of when the move was played. Optional for backward compatibility. */
  at?: Date;
};
