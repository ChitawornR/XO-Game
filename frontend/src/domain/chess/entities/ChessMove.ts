import type { Piece, PieceType } from './Piece'
import type { Square } from './Square'

/**
 * Represents a single chess move with all metadata needed for:
 * - Applying the move to the board
 * - Generating move notation
 * - En-passant tracking
 * - Castling
 * - Promotion
 */
export type ChessMove = {
  from: Square
  to: Square
  piece: Piece
  /** The piece that was captured (including en-passant captures). */
  captured?: Piece | null
  /** The piece type to promote to (only for pawn reaching back rank). */
  promotion?: PieceType
  /** Indicates a castling move and which side. */
  isCastle?: 'kingside' | 'queenside'
  /** True when this move is an en-passant capture. */
  isEnPassant?: boolean
  /** Timestamp / notation string (optional, for history display). */
  at?: string
}
