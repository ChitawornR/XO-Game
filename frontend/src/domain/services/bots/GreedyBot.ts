import type { Board } from '../../entities/Board'
import type { BotMove, BotStrategy } from './BotStrategy'
import { findWinner } from '../winnerChecker'
import { placeMove } from '../boardOps'

/**
 * GreedyBot — three-step greedy strategy (ported from original BoardGame.jsx):
 *   1. Win immediately if possible.
 *   2. Block the opponent from winning immediately.
 *   3. Fall back to a random empty cell.
 */
export class GreedyBot implements BotStrategy {
  decide(board: Board, streak: number, player: 'X' | 'O'): BotMove | null {
    const opponent: 'X' | 'O' = player === 'X' ? 'O' : 'X'
    const size = board.length

    // Step 1: try to win
    const winMove = this.findWinningMove(board, streak, player, size)
    if (winMove) return winMove

    // Step 2: block opponent from winning
    const blockMove = this.findWinningMove(board, streak, opponent, size)
    if (blockMove) return blockMove

    // Step 3: random empty cell
    const emptyCells: BotMove[] = []
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') emptyCells.push({ row, col })
      }
    }
    if (emptyCells.length === 0) return null
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }

  private findWinningMove(
    board: Board,
    streak: number,
    forPlayer: 'X' | 'O',
    size: number,
  ): BotMove | null {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] !== '') continue
        const candidate = placeMove(board, row, col, forPlayer)
        if (findWinner(candidate, streak) === forPlayer) return { row, col }
      }
    }
    return null
  }
}
