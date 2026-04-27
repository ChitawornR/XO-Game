import { Move } from './Move';
import { Player } from './Player';
import { DomainError } from '../errors/DomainError';

export type Replay = {
  id?: string;
  size: number;
  winner: Player | null;
  moves: Move[];
  isSinglePlayer: boolean;
  isOnline: boolean;
  createdAt: Date;
  userId?: string;
};

/**
 * Move shape accepted by createReplay — `at` may arrive as an ISO string from
 * HTTP boundaries; the factory normalises it to a Date.
 */
type MoveInput = Omit<Move, 'at'> & { at?: Date | string };

/**
 * Factory function that validates input and creates a Replay value object.
 * Throws DomainError if any invariant is violated.
 */
export function createReplay(input: {
  size: number;
  winner: Player | null;
  moves: MoveInput[];
  isSinglePlayer: boolean;
  isOnline?: boolean;
}): Omit<Replay, 'id'> {
  const { size, winner, moves, isSinglePlayer, isOnline = false } = input;

  if (!Number.isInteger(size) || size < 3 || size > 10) {
    throw new DomainError('Board size must be an integer between 3 and 10.');
  }

  if (winner !== null && winner !== 'X' && winner !== 'O') {
    throw new DomainError("Winner must be 'X', 'O', or null.");
  }

  if (!Array.isArray(moves) || moves.length === 0) {
    throw new DomainError('Replay must contain at least one move.');
  }

  const normalisedMoves: Move[] = moves.map((move) => {
    if (
      !Number.isInteger(move.row) ||
      !Number.isInteger(move.col) ||
      move.row < 0 || move.row >= size ||
      move.col < 0 || move.col >= size
    ) {
      throw new DomainError(
        `Move (${move.row}, ${move.col}) is out of bounds for board size ${size}.`
      );
    }
    if (move.player !== 'X' && move.player !== 'O') {
      throw new DomainError("Each move's player must be 'X' or 'O'.");
    }

    let at: Date | undefined;
    if (move.at !== undefined) {
      at = move.at instanceof Date ? move.at : new Date(move.at);
      if (isNaN(at.getTime())) {
        throw new DomainError(`Move at "${String(move.at)}" is not a valid date.`);
      }
    }

    return { row: move.row, col: move.col, player: move.player, at };
  });

  return {
    size,
    winner,
    moves: normalisedMoves,
    isSinglePlayer,
    isOnline,
    createdAt: new Date(),
  };
}
