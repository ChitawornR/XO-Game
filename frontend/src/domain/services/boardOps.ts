import type { Board } from '../entities/Board'
import type { Cell } from '../entities/Cell'
import type { Player } from '../entities/Player'

/** Create a fresh size×size board filled with empty strings. */
export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<Cell>(size).fill(''))
}

/**
 * Returns a new board with the given player's mark placed at (row, col).
 * Does not mutate the original board.
 */
export function placeMove(board: Board, row: number, col: number, player: Player): Board {
  return board.map((r, i) =>
    r.map((cell, j) => (i === row && j === col ? player : cell))
  )
}

/** Returns true when every cell is occupied. */
export function isBoardFull(board: Board): boolean {
  return board.flat().every((cell) => cell !== '')
}
