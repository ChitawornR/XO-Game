/**
 * Check / checkmate / stalemate detection.
 *
 * Dependency graph:
 *   attackMap  ←  checkDetector  ←  boardOps / useChessGame
 *
 * `isCheckmate` and `isStalemate` need `getLegalMovesForColor` from
 * moveGenerator, but moveGenerator also imports from this module via
 * attackMap (no direct import of checkDetector). So we can safely import
 * getLegalMovesForColor here; ES module live bindings resolve the cycle.
 */

import type { ChessBoard } from '../entities/ChessBoard'
import type { Color } from '../entities/Piece'
import type { Square } from '../entities/Square'
import type { ChessGameState } from '../entities/ChessGameState'
import { kingInCheck, findKingSquare } from './attackMap'
import { getLegalMovesForColor } from './moveGenerator'

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { isSquareAttackedBy as isSquareAttacked } from './attackMap'

/** Returns the square of `color`'s king, or null. */
export function findKing(board: ChessBoard, color: Color): Square | null {
  return findKingSquare(board, color)
}

/** Returns true if `color`'s king is in check. */
export function isInCheck(board: ChessBoard, color: Color): boolean {
  return kingInCheck(board, color)
}

// ---------------------------------------------------------------------------
// Terminal-state detection
// ---------------------------------------------------------------------------

/** True when the current player is in checkmate (in check + no legal moves). */
export function isCheckmate(state: ChessGameState): boolean {
  if (!isInCheck(state.board, state.currentPlayer)) return false
  return getLegalMovesForColor(state).length === 0
}

/** True when the current player is NOT in check but has no legal moves. */
export function isStalemate(state: ChessGameState): boolean {
  if (isInCheck(state.board, state.currentPlayer)) return false
  return getLegalMovesForColor(state).length === 0
}
