import type { Board } from '../../entities/Board'

export type BotMove = { row: number; col: number }

/**
 * Strategy interface for bot move decision.
 * Implement this to add new bot difficulty levels without touching UI code.
 */
export interface BotStrategy {
  /**
   * Decide the next move for the bot.
   *
   * @param board   Current board state
   * @param streak  Winning streak length for this board size
   * @param player  The player symbol the bot is playing as
   * @returns       A {row, col} to place the mark, or null if no move is possible
   */
  decide(board: Board, streak: number, player: 'X' | 'O'): BotMove | null
}
