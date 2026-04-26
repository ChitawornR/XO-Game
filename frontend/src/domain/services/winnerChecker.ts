import type { Board } from '../entities/Board'
import type { Player } from '../entities/Player'

/**
 * Scans the board for a winning streak.
 * Pure function — no React, no side effects.
 *
 * @param board  Current board state
 * @param streak Number of consecutive marks needed to win
 * @returns      The winning Player ('X' | 'O') or null if no winner yet
 */
export function findWinner(board: Board, streak: number): Player | null {
  const size = board.length

  // Check rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - streak; col++) {
      const first = board[row][col]
      if (first === '') continue
      let win = true
      for (let i = 1; i < streak; i++) {
        if (board[row][col + i] !== first) { win = false; break }
      }
      if (win) return first as Player
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - streak; row++) {
      const first = board[row][col]
      if (first === '') continue
      let win = true
      for (let i = 1; i < streak; i++) {
        if (board[row + i][col] !== first) { win = false; break }
      }
      if (win) return first as Player
    }
  }

  // Check diagonal left-to-right (↘)
  for (let row = 0; row <= size - streak; row++) {
    for (let col = 0; col <= size - streak; col++) {
      const first = board[row][col]
      if (first === '') continue
      let win = true
      for (let i = 1; i < streak; i++) {
        if (board[row + i][col + i] !== first) { win = false; break }
      }
      if (win) return first as Player
    }
  }

  // Check diagonal right-to-left (↙)
  for (let row = 0; row <= size - streak; row++) {
    for (let col = size - 1; col >= streak - 1; col--) {
      const first = board[row][col]
      if (first === '') continue
      let win = true
      for (let i = 1; i < streak; i++) {
        if (board[row + i][col - i] !== first) { win = false; break }
      }
      if (win) return first as Player
    }
  }

  return null
}
