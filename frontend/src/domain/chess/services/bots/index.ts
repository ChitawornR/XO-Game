import type { ChessBotStrategy } from './ChessBotStrategy'
import { RandomBot } from './RandomBot'

export type ChessDifficulty = 'easy'

/**
 * Factory mapping a ChessDifficulty to a concrete ChessBotStrategy.
 * Add new cases here to expose additional bot strengths to the UI.
 */
export function makeChessBot(difficulty: ChessDifficulty): ChessBotStrategy {
  switch (difficulty) {
    case 'easy':
      return new RandomBot()
  }
}

export type { ChessBotStrategy } from './ChessBotStrategy'
export { RandomBot } from './RandomBot'
