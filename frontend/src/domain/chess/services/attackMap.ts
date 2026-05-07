/**
 * Low-level attack / threat map helpers.
 *
 * This file sits at the bottom of the dependency graph:
 *   attackMap.ts  ← (no domain service imports)
 *
 * It contains the raw sliding / stepping move logic duplicated minimally so
 * that moveGenerator.ts and checkDetector.ts can both use it without a cycle.
 */

import type { ChessBoard } from '../entities/ChessBoard'
import type { Color } from '../entities/Piece'
import type { Square } from '../entities/Square'
import { inBounds, squareEquals } from '../entities/Square'

// ---------------------------------------------------------------------------
// Reachability helpers (no color-legality filtering — pure geometry)
// ---------------------------------------------------------------------------

function slidingAttacks(
  board: ChessBoard,
  from: Square,
  directions: ReadonlyArray<readonly [number, number]>,
): Square[] {
  const result: Square[] = []
  for (const [dr, dc] of directions) {
    let r = from.row + dr
    let c = from.col + dc
    while (inBounds({ row: r, col: c })) {
      result.push({ row: r, col: c })
      if (board[r][c] !== null) break // blocked
      r += dr
      c += dc
    }
  }
  return result
}

/** All squares a rook at `from` can reach (ignoring own-piece blocking for raw attack). */
function rookAttacks(board: ChessBoard, from: Square): Square[] {
  return slidingAttacks(board, from, [
    [-1, 0] as const, [1, 0] as const, [0, -1] as const, [0, 1] as const,
  ])
}

function bishopAttacks(board: ChessBoard, from: Square): Square[] {
  return slidingAttacks(board, from, [
    [-1, -1] as const, [-1, 1] as const, [1, -1] as const, [1, 1] as const,
  ])
}

function queenAttacks(board: ChessBoard, from: Square): Square[] {
  return [...rookAttacks(board, from), ...bishopAttacks(board, from)]
}

function knightAttacks(from: Square): Square[] {
  return (
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] as const
  )
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(inBounds)
}

function kingAttacks(from: Square): Square[] {
  return (
    [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ] as const
  )
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(inBounds)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns true if `square` is attacked by any piece of `byColor`.
 *
 * - Pawns attack diagonally (we check attack squares directly, not moves).
 * - All other pieces: compute geometric reachability stopping at blockers.
 *   Own/opponent blocking rules do NOT matter for attack detection — a piece
 *   is "attacked" if an enemy piece's attack ray reaches it, even if there
 *   is a friendly piece between (it would just block, but we still register the
 *   "threat" geometry).  Actually, for correct check detection we DO need to
 *   stop at the FIRST blocker, which slidingAttacks already does.
 */
export function isSquareAttackedBy(
  board: ChessBoard,
  square: Square,
  byColor: Color,
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.color !== byColor) continue

      const from: Square = { row, col }

      switch (piece.type) {
        case 'pawn': {
          const dir = byColor === 'white' ? -1 : 1
          const ar = row + dir
          if (
            (ar === square.row && col - 1 === square.col) ||
            (ar === square.row && col + 1 === square.col)
          ) return true
          break
        }
        case 'rook':
          if (rookAttacks(board, from).some(s => squareEquals(s, square))) return true
          break
        case 'bishop':
          if (bishopAttacks(board, from).some(s => squareEquals(s, square))) return true
          break
        case 'queen':
          if (queenAttacks(board, from).some(s => squareEquals(s, square))) return true
          break
        case 'knight':
          if (knightAttacks(from).some(s => squareEquals(s, square))) return true
          break
        case 'king':
          if (kingAttacks(from).some(s => squareEquals(s, square))) return true
          break
      }
    }
  }
  return false
}

/** Returns the king square for `color`, or null. */
export function findKingSquare(board: ChessBoard, color: Color): Square | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

/** Returns true if the `color` king is in check. */
export function kingInCheck(board: ChessBoard, color: Color): boolean {
  const sq = findKingSquare(board, color)
  if (!sq) return false
  const opp: Color = color === 'white' ? 'black' : 'white'
  return isSquareAttackedBy(board, sq, opp)
}
