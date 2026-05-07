import type { ChessBoard } from './ChessBoard'
import type { Color } from './Piece'
import type { ChessMove } from './ChessMove'
import type { Square } from './Square'

export type ChessGameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw'

export type ChessGameState = {
  board: ChessBoard
  currentPlayer: Color
  moves: ChessMove[]
  status: ChessGameStatus
  winner: Color | null
  /**
   * The square that a pawn just double-pushed past — the target for
   * an en-passant capture on the next half-move. Null when no ep is possible.
   */
  enPassantTarget: Square | null
  /**
   * Half-move clock for the fifty-move rule.
   * Resets to 0 on pawn moves and captures.
   */
  halfMoveClock: number
  /** Full move number, increments after black's move. */
  fullMoveNumber: number
}
