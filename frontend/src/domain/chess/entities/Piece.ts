/**
 * Chess piece types and colors.
 */

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export type Color = 'white' | 'black'

export type Piece = {
  type: PieceType
  color: Color
  /** Tracks whether the piece has moved — used for castling rights and pawn double-push. */
  hasMoved: boolean
}
