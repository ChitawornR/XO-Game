/**
 * boardOps — applies a chess move to a ChessGameState and returns a new state.
 *
 * Handles:
 *   - Normal moves (piece move + capture)
 *   - Pawn promotion (replaces pawn with promotion piece)
 *   - En-passant (removes captured pawn from the board)
 *   - Castling (moves both king and rook)
 *   - hasMoved tracking
 *   - enPassantTarget update (set on double pawn push, cleared otherwise)
 *   - halfMoveClock and fullMoveNumber
 *   - Status update (check / checkmate / stalemate)
 */

import type { ChessGameState } from '../entities/ChessGameState'
import type { ChessMove } from '../entities/ChessMove'
import type { Color } from '../entities/Piece'
import { getPiece, setPiece } from '../entities/ChessBoard'
import { isInCheck, isCheckmate, isStalemate } from './checkDetector'

export function applyMove(
  state: ChessGameState,
  move: ChessMove,
): ChessGameState {
  const { board, currentPlayer, moves, halfMoveClock, fullMoveNumber } = state
  let newBoard = board

  const movingPiece = move.piece
  const isCapture = !!move.captured
  const isPawnMove = movingPiece.type === 'pawn'

  // ---------------------------------------------------------------------------
  // 1. Move the piece (mark hasMoved)
  // ---------------------------------------------------------------------------
  newBoard = setPiece(newBoard, move.from, null)
  newBoard = setPiece(newBoard, move.to, { ...movingPiece, hasMoved: true })

  // ---------------------------------------------------------------------------
  // 2. Promotion — replace pawn with chosen piece
  // ---------------------------------------------------------------------------
  if (move.promotion) {
    newBoard = setPiece(newBoard, move.to, {
      type: move.promotion,
      color: movingPiece.color,
      hasMoved: true,
    })
  }

  // ---------------------------------------------------------------------------
  // 3. En-passant — remove captured pawn (it's not on the destination square)
  // ---------------------------------------------------------------------------
  if (move.isEnPassant) {
    const capturedPawnRow =
      movingPiece.color === 'white' ? move.to.row + 1 : move.to.row - 1
    newBoard = setPiece(newBoard, { row: capturedPawnRow, col: move.to.col }, null)
  }

  // ---------------------------------------------------------------------------
  // 4. Castling — also move the rook
  // ---------------------------------------------------------------------------
  if (move.isCastle) {
    const row = movingPiece.color === 'white' ? 7 : 0
    if (move.isCastle === 'kingside') {
      const rook = getPiece(newBoard, { row, col: 7 })
      if (rook) {
        newBoard = setPiece(newBoard, { row, col: 7 }, null)
        newBoard = setPiece(newBoard, { row, col: 5 }, { ...rook, hasMoved: true })
      }
    } else {
      const rook = getPiece(newBoard, { row, col: 0 })
      if (rook) {
        newBoard = setPiece(newBoard, { row, col: 0 }, null)
        newBoard = setPiece(newBoard, { row, col: 3 }, { ...rook, hasMoved: true })
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. En-passant target for next move
  // ---------------------------------------------------------------------------
  let newEnPassantTarget = null
  if (
    isPawnMove &&
    Math.abs(move.to.row - move.from.row) === 2
  ) {
    // The en-passant target is the square the pawn skipped over
    const epRow = (move.from.row + move.to.row) / 2
    newEnPassantTarget = { row: epRow, col: move.from.col }
  }

  // ---------------------------------------------------------------------------
  // 6. Clocks
  // ---------------------------------------------------------------------------
  const newHalfMoveClock =
    isPawnMove || isCapture || move.isEnPassant ? 0 : halfMoveClock + 1
  const nextPlayer: Color = currentPlayer === 'white' ? 'black' : 'white'
  const newFullMoveNumber =
    currentPlayer === 'black' ? fullMoveNumber + 1 : fullMoveNumber

  // ---------------------------------------------------------------------------
  // 7. Determine status for the NEXT player
  // ---------------------------------------------------------------------------
  const nextState: ChessGameState = {
    board: newBoard,
    currentPlayer: nextPlayer,
    moves: [...moves, move],
    status: 'playing',
    winner: null,
    enPassantTarget: newEnPassantTarget,
    halfMoveClock: newHalfMoveClock,
    fullMoveNumber: newFullMoveNumber,
  }

  if (isCheckmate(nextState)) {
    return { ...nextState, status: 'checkmate', winner: currentPlayer }
  }

  if (isStalemate(nextState)) {
    return { ...nextState, status: 'stalemate' }
  }

  if (newHalfMoveClock >= 100) {
    // Fifty-move rule (100 half-moves)
    return { ...nextState, status: 'draw' }
  }

  if (isInCheck(newBoard, nextPlayer)) {
    return { ...nextState, status: 'check' }
  }

  return nextState
}

// ---------------------------------------------------------------------------
// Helper: determine if a king-to-destination was a castle move
// ---------------------------------------------------------------------------

/**
 * Given a king move, returns the castling side if it was a castle, else undefined.
 */
export function detectCastle(
  from: { row: number; col: number },
  to: { row: number; col: number },
): 'kingside' | 'queenside' | undefined {
  if (from.col === 4 && to.col === 6) return 'kingside'
  if (from.col === 4 && to.col === 2) return 'queenside'
  return undefined
}
