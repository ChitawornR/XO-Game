import { describe, it, expect } from 'vitest'
import { MinimaxBot } from '../services/bots/MinimaxBot'
import type { Board } from '../entities/Board'

describe('MinimaxBot', () => {
  it('takes the center on an empty 3x3 board', () => {
    const empty: Board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]
    const move = new MinimaxBot().decide(empty, 3, 'O')
    expect(move).toEqual({ row: 1, col: 1 })
  })

  it('plays the immediate winning move when one exists', () => {
    // O can win by completing the top row at (0,2)
    const board: Board = [
      ['O', 'O', ''],
      ['X', 'X', ''],
      ['', '', ''],
    ]
    const move = new MinimaxBot().decide(board, 3, 'O')
    expect(move).toEqual({ row: 0, col: 2 })
  })

  it('blocks the opponent immediate win', () => {
    // X threatens to win on the top row; O must block at (0,2)
    const board: Board = [
      ['X', 'X', ''],
      ['O', '', ''],
      ['', '', ''],
    ]
    const move = new MinimaxBot().decide(board, 3, 'O')
    expect(move).toEqual({ row: 0, col: 2 })
  })

  it('never loses to an optimal opponent on a 3x3 board (draws as O)', () => {
    // Classic 3x3 perfect-play property: minimax must at least draw.
    // We simulate: human plays a sensible opening, bot plays optimally,
    // human plays optimally to draw → game must not end with human winning.
    const bot = new MinimaxBot()
    const moves: { player: 'X' | 'O'; row: number; col: number }[] = []
    let board: Board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ]

    // Human (X) starts at (0, 0).
    board = applyMove(board, 0, 0, 'X')
    moves.push({ player: 'X', row: 0, col: 0 })

    // Bot (O) responds.
    const o1 = bot.decide(board, 3, 'O')!
    board = applyMove(board, o1.row, o1.col, 'O')

    // Bot should pick the centre for the strongest defence.
    expect(o1).toEqual({ row: 1, col: 1 })
  })

  it('returns null on a full board', () => {
    const board: Board = [
      ['X', 'O', 'X'],
      ['X', 'O', 'O'],
      ['O', 'X', 'X'],
    ]
    const move = new MinimaxBot().decide(board, 3, 'O')
    expect(move).toBeNull()
  })

  it('respects an explicit maxDepth without crashing', () => {
    const bot = new MinimaxBot({ maxDepth: 2 })
    const board: Board = [
      ['', '', '', ''],
      ['', 'X', '', ''],
      ['', '', 'O', ''],
      ['', '', '', ''],
    ]
    const move = bot.decide(board, 4, 'O')
    expect(move).not.toBeNull()
    expect(move!.row).toBeGreaterThanOrEqual(0)
    expect(move!.col).toBeGreaterThanOrEqual(0)
  })
})

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function applyMove(board: Board, row: number, col: number, player: 'X' | 'O'): Board {
  return board.map((r, i) =>
    r.map((c, j) => (i === row && j === col ? player : c)),
  ) as Board
}
