import { describe, it, expect } from 'vitest'
import { findWinner } from '../services/winnerChecker'
import type { Board } from '../entities/Board'

// Helper to build a 3x3 board from a flat string array (length 9)
function board3(cells: string[]): Board {
  return [
    [cells[0], cells[1], cells[2]],
    [cells[3], cells[4], cells[5]],
    [cells[6], cells[7], cells[8]],
  ] as Board
}

describe('findWinner — 3x3 board (streak = 3)', () => {
  it('detects a row win for X', () => {
    const b = board3(['X', 'X', 'X', 'O', 'O', '', '', '', ''])
    expect(findWinner(b, 3)).toBe('X')
  })

  it('detects a column win for O', () => {
    const b = board3(['O', 'X', '', 'O', 'X', '', 'O', '', ''])
    expect(findWinner(b, 3)).toBe('O')
  })

  it('detects a diagonal (↘) win for X', () => {
    const b = board3(['X', 'O', '', 'O', 'X', '', '', '', 'X'])
    expect(findWinner(b, 3)).toBe('X')
  })

  it('detects a diagonal (↙) win for O', () => {
    const b = board3(['', 'X', 'O', '', 'O', 'X', 'O', '', ''])
    expect(findWinner(b, 3)).toBe('O')
  })

  it('returns null when there is no winner', () => {
    const b = board3(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])
    expect(findWinner(b, 3)).toBeNull()
  })
})

describe('findWinner — 4x4 board (streak = 4)', () => {
  it('detects a 4-in-a-row win', () => {
    const b: Board = [
      ['X', 'X', 'X', 'X'],
      ['O', 'O', 'O', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ] as Board
    expect(findWinner(b, 4)).toBe('X')
  })

  it('does NOT count 3 consecutive as a win when streak = 4', () => {
    const b: Board = [
      ['X', 'X', 'X', ''],
      ['O', 'O', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ] as Board
    expect(findWinner(b, 4)).toBeNull()
  })
})
