import type { Board } from '../../domain/entities/Board'
import type { Player } from '../../domain/entities/Player'
import type { Move } from '../../domain/entities/Move'
import { placeMove } from '../../domain/services/boardOps'
import { findWinner } from '../../domain/services/winnerChecker'
import { isBoardFull } from '../../domain/services/boardOps'

export type PlayMoveResult = {
  board: Board
  moves: Move[]
  winner: Player | null
  isDraw: boolean
}

/**
 * Apply a single player move to the board and evaluate the result.
 * Pure use-case — no React, no side effects.
 */
export function playMove(
  board: Board,
  existingMoves: Move[],
  row: number,
  col: number,
  player: Player,
  streak: number,
): PlayMoveResult {
  const nextBoard = placeMove(board, row, col, player)
  const nextMoves: Move[] = [...existingMoves, { row, col, player }]
  const winner = findWinner(nextBoard, streak)
  const isDraw = !winner && isBoardFull(nextBoard)
  return { board: nextBoard, moves: nextMoves, winner, isDraw }
}
