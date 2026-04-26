import { describe, it, expect } from 'vitest'
import { GreedyBot } from '../services/bots/GreedyBot'
import type { Board } from '../entities/Board'

const bot = new GreedyBot()

describe('GreedyBot', () => {
  it('takes the winning move when available', () => {
    // O needs [2][2] to win on the diagonal
    const board: Board = [
      ['O', 'X', ''],
      ['X', 'O', ''],
      ['', '', ''],
    ] as Board
    const move = bot.decide(board, 3, 'O')
    expect(move).toEqual({ row: 2, col: 2 })
  })

  it('blocks X from winning instead of making a random move', () => {
    // X is one move away from winning at [0][2]; bot should block there
    const board: Board = [
      ['X', 'X', ''],
      ['O', '', ''],
      ['', '', ''],
    ] as Board
    const move = bot.decide(board, 3, 'O')
    expect(move).toEqual({ row: 0, col: 2 })
  })
})
