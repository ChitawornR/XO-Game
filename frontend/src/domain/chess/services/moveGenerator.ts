/**
 * Move generator — pure functions only, no React.
 *
 * Dependency graph (no cycles):
 *   attackMap.ts  ←  moveGenerator.ts  ←  checkDetector.ts
 *                                      ←  boardOps.ts
 */

import type { ChessBoard } from '../entities/ChessBoard'
import type { Piece, Color } from '../entities/Piece'
import type { Square } from '../entities/Square'
import type { ChessGameState } from '../entities/ChessGameState'
import { getPiece, setPiece } from '../entities/ChessBoard'
import { inBounds, squareEquals } from '../entities/Square'
import { isSquareAttackedBy, kingInCheck } from './attackMap'

// ---------------------------------------------------------------------------
// Sliding piece helpers
// ---------------------------------------------------------------------------

function slidingMoves(
  board: ChessBoard,
  from: Square,
  piece: Piece,
  directions: ReadonlyArray<readonly [number, number]>,
): Square[] {
  const result: Square[] = []
  for (const [dr, dc] of directions) {
    let r = from.row + dr
    let c = from.col + dc
    while (inBounds({ row: r, col: c })) {
      const target = board[r][c]
      if (target === null) {
        result.push({ row: r, col: c })
      } else {
        if (target.color !== piece.color) {
          result.push({ row: r, col: c }) // capture
        }
        break // blocked
      }
      r += dr
      c += dc
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// Piece-specific pseudo-legal generators
// ---------------------------------------------------------------------------

function rookMoves(board: ChessBoard, from: Square, piece: Piece): Square[] {
  return slidingMoves(board, from, piece, [
    [-1, 0] as const, [1, 0] as const, [0, -1] as const, [0, 1] as const,
  ])
}

function bishopMoves(board: ChessBoard, from: Square, piece: Piece): Square[] {
  return slidingMoves(board, from, piece, [
    [-1, -1] as const, [-1, 1] as const, [1, -1] as const, [1, 1] as const,
  ])
}

function queenMoves(board: ChessBoard, from: Square, piece: Piece): Square[] {
  return slidingMoves(board, from, piece, [
    [-1, 0] as const, [1, 0] as const, [0, -1] as const, [0, 1] as const,
    [-1, -1] as const, [-1, 1] as const, [1, -1] as const, [1, 1] as const,
  ])
}

function knightMoves(board: ChessBoard, from: Square, piece: Piece): Square[] {
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ] as const
  return offsets
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(sq => inBounds(sq))
    .filter(sq => {
      const target = board[sq.row][sq.col]
      return target === null || target.color !== piece.color
    })
}

function kingNormalMoves(board: ChessBoard, from: Square, piece: Piece): Square[] {
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ] as const
  return offsets
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(sq => inBounds(sq))
    .filter(sq => {
      const target = board[sq.row][sq.col]
      return target === null || target.color !== piece.color
    })
}

function pawnMoves(
  board: ChessBoard,
  from: Square,
  piece: Piece,
  enPassantTarget: Square | null,
): Square[] {
  const result: Square[] = []
  const dir = piece.color === 'white' ? -1 : 1
  const startRow = piece.color === 'white' ? 6 : 1

  // Forward one
  const oneStep = { row: from.row + dir, col: from.col }
  if (inBounds(oneStep) && board[oneStep.row][oneStep.col] === null) {
    result.push(oneStep)
    // Forward two from start
    if (from.row === startRow) {
      const twoStep = { row: from.row + 2 * dir, col: from.col }
      if (inBounds(twoStep) && board[twoStep.row][twoStep.col] === null) {
        result.push(twoStep)
      }
    }
  }

  // Diagonal captures (including en-passant)
  for (const dc of [-1, 1]) {
    const diag = { row: from.row + dir, col: from.col + dc }
    if (!inBounds(diag)) continue
    const target = board[diag.row][diag.col]
    if (target !== null && target.color !== piece.color) {
      result.push(diag)
    } else if (enPassantTarget && squareEquals(diag, enPassantTarget)) {
      result.push(diag)
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Castling target squares
// ---------------------------------------------------------------------------

function castlingTargets(board: ChessBoard, from: Square, piece: Piece): Square[] {
  if (piece.type !== 'king' || piece.hasMoved) return []

  const row = piece.color === 'white' ? 7 : 0
  if (from.row !== row || from.col !== 4) return []

  const result: Square[] = []
  const opp: Color = piece.color === 'white' ? 'black' : 'white'

  // Helper: all squares from king path must not be attacked, squares between must be empty
  const kingsideSafe = (): boolean => {
    const kRook = board[row][7]
    if (!kRook || kRook.type !== 'rook' || kRook.color !== piece.color || kRook.hasMoved) return false
    if (getPiece(board, { row, col: 5 }) !== null) return false
    if (getPiece(board, { row, col: 6 }) !== null) return false
    for (const col of [4, 5, 6]) {
      if (isSquareAttackedBy(board, { row, col }, opp)) return false
    }
    return true
  }

  const queensideSafe = (): boolean => {
    const qRook = board[row][0]
    if (!qRook || qRook.type !== 'rook' || qRook.color !== piece.color || qRook.hasMoved) return false
    if (getPiece(board, { row, col: 1 }) !== null) return false
    if (getPiece(board, { row, col: 2 }) !== null) return false
    if (getPiece(board, { row, col: 3 }) !== null) return false
    for (const col of [4, 3, 2]) {
      if (isSquareAttackedBy(board, { row, col }, opp)) return false
    }
    return true
  }

  if (kingsideSafe()) result.push({ row, col: 6 })
  if (queensideSafe()) result.push({ row, col: 2 })

  return result
}

// ---------------------------------------------------------------------------
// Public: pseudo-legal moves (ignores own-king-in-check)
// ---------------------------------------------------------------------------

/**
 * Returns squares the piece at `from` can reach without checking whether the
 * resulting position leaves the own king in check.
 */
export function getPseudoLegalMoves(
  board: ChessBoard,
  from: Square,
  enPassantTarget: Square | null,
): Square[] {
  const piece = getPiece(board, from)
  if (!piece) return []

  switch (piece.type) {
    case 'rook':   return rookMoves(board, from, piece)
    case 'bishop': return bishopMoves(board, from, piece)
    case 'queen':  return queenMoves(board, from, piece)
    case 'knight': return knightMoves(board, from, piece)
    case 'king':   return kingNormalMoves(board, from, piece)
    case 'pawn':   return pawnMoves(board, from, piece, enPassantTarget)
  }
}

// ---------------------------------------------------------------------------
// Internal: simulate a half-move and check if own king is in check
// ---------------------------------------------------------------------------

function moveLeavesKingInCheck(
  board: ChessBoard,
  from: Square,
  to: Square,
  enPassantTarget: Square | null,
): boolean {
  const piece = getPiece(board, from)
  if (!piece) return false

  let b = setPiece(board, to, { ...piece, hasMoved: true })
  b = setPiece(b, from, null)

  // En-passant: remove the captured pawn
  if (piece.type === 'pawn' && enPassantTarget && squareEquals(to, enPassantTarget)) {
    const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1
    b = setPiece(b, { row: capturedRow, col: to.col }, null)
  }

  return kingInCheck(b, piece.color)
}

// ---------------------------------------------------------------------------
// Public: fully legal moves for a single square
// ---------------------------------------------------------------------------

/**
 * Returns legal destination squares for the piece at `square`.
 * Filters pseudo-legal moves that would leave own king in check.
 * Adds castling when king is not currently in check.
 */
export function getLegalMoves(
  board: ChessBoard,
  square: Square,
  state: ChessGameState,
): Square[] {
  const piece = getPiece(board, square)
  if (!piece) return []

  const pseudo = getPseudoLegalMoves(board, square, state.enPassantTarget)
  const legal: Square[] = []

  for (const to of pseudo) {
    if (!moveLeavesKingInCheck(board, square, to, state.enPassantTarget)) {
      legal.push(to)
    }
  }

  // Castling only when not currently in check
  if (piece.type === 'king' && !kingInCheck(board, piece.color)) {
    legal.push(...castlingTargets(board, square, piece))
  }

  return legal
}

// ---------------------------------------------------------------------------
// Public: all legal moves for the current player
// ---------------------------------------------------------------------------

export type LegalMoveEntry = { from: Square; to: Square }

/** Enumerates all legal moves for the current player (used for checkmate/stalemate detection). */
export function getLegalMovesForColor(state: ChessGameState): LegalMoveEntry[] {
  const { board, currentPlayer, enPassantTarget } = state
  const all: LegalMoveEntry[] = []
  const notInCheck = !kingInCheck(board, currentPlayer)

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.color !== currentPlayer) continue

      const from: Square = { row, col }
      const pseudo = getPseudoLegalMoves(board, from, enPassantTarget)

      for (const to of pseudo) {
        if (!moveLeavesKingInCheck(board, from, to, enPassantTarget)) {
          all.push({ from, to })
        }
      }

      if (piece.type === 'king' && notInCheck) {
        for (const to of castlingTargets(board, from, piece)) {
          all.push({ from, to })
        }
      }
    }
  }

  return all
}

// Re-export for external consumers
export { isSquareAttackedBy as isSquareAttacked } from './attackMap'
export { kingInCheck as isInCheckFn } from './attackMap'
