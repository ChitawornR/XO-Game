import type { ChessGameState } from '../../entities/ChessGameState'
import type { ChessMove } from '../../entities/ChessMove'

/**
 * Strategy interface for chess bots.
 * Implement this interface to add new difficulty levels without touching UI code.
 */
export interface ChessBotStrategy {
  /**
   * Choose a move for the current player in the given game state.
   * Returns null when there are no legal moves (game should already be over).
   */
  decide(state: ChessGameState): ChessMove | null
}
