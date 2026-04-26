import type { Board } from './Board'
import type { Player } from './Player'
import type { Move } from './Move'

export type GameStatus = 'playing' | 'won' | 'draw'

export type GameState = {
  board: Board
  currentPlayer: Player
  moves: Move[]
  winner: Player | null
  status: GameStatus
  isSinglePlayer: boolean
  size: number
  streak: number
}
