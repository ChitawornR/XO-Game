import type { Piece, PieceType, Color } from './Piece'
import type { Square } from './Square'

/**
 * The board is an 8×8 grid.
 * Each cell is either null (empty) or a Piece.
 * Immutable operations return a new board copy.
 */
export type ChessBoard = (Piece | null)[][]

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function p(type: PieceType, color: Color): Piece {
  return { type, color, hasMoved: false }
}

/**
 * Creates the standard chess starting position.
 * Row 0 = rank 8 (black's back rank).
 * Row 7 = rank 1 (white's back rank).
 */
export function createInitialBoard(): ChessBoard {
  const _ = null

  const blackBack: Piece[] = [
    p('rook', 'black'), p('knight', 'black'), p('bishop', 'black'), p('queen', 'black'),
    p('king', 'black'), p('bishop', 'black'), p('knight', 'black'), p('rook', 'black'),
  ]
  const blackPawns: Piece[] = Array(8).fill(null).map(() => p('pawn', 'black'))
  const whitePawns: Piece[] = Array(8).fill(null).map(() => p('pawn', 'white'))
  const whiteBack: Piece[] = [
    p('rook', 'white'), p('knight', 'white'), p('bishop', 'white'), p('queen', 'white'),
    p('king', 'white'), p('bishop', 'white'), p('knight', 'white'), p('rook', 'white'),
  ]

  return [
    blackBack,           // row 0 — rank 8
    blackPawns,          // row 1 — rank 7
    [_, _, _, _, _, _, _, _],  // row 2
    [_, _, _, _, _, _, _, _],  // row 3
    [_, _, _, _, _, _, _, _],  // row 4
    [_, _, _, _, _, _, _, _],  // row 5
    whitePawns,          // row 6 — rank 2
    whiteBack,           // row 7 — rank 1
  ]
}

// ---------------------------------------------------------------------------
// Accessor helpers (pure / immutable)
// ---------------------------------------------------------------------------

export function getPiece(board: ChessBoard, sq: Square): Piece | null {
  return board[sq.row][sq.col]
}

/**
 * Returns a new board with the piece at `sq` set to `piece` (or null to clear).
 * Does NOT mutate the original board.
 */
export function setPiece(board: ChessBoard, sq: Square, piece: Piece | null): ChessBoard {
  const newBoard = board.map(row => [...row])
  newBoard[sq.row][sq.col] = piece
  return newBoard
}

/** Shallow-clone the board (each row is a new array; piece objects are shared). */
export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.map(row => [...row])
}
