import type { BotStrategy } from './BotStrategy'
import { GreedyBot } from './GreedyBot'
import { MinimaxBot } from './MinimaxBot'

export type Difficulty = 'easy' | 'hard'

/**
 * Factory mapping a Difficulty to a concrete BotStrategy.
 * Add a new case here to expose another bot variant to the UI.
 */
export function makeBot(difficulty: Difficulty): BotStrategy {
  switch (difficulty) {
    case 'easy':
      return new GreedyBot()
    case 'hard':
      return new MinimaxBot()
  }
}

export type { BotStrategy } from './BotStrategy'
export { GreedyBot } from './GreedyBot'
export { MinimaxBot } from './MinimaxBot'
