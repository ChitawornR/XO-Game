import { describe, it, expect } from 'vitest'
import { createInitialBoard, getPiece, setPiece } from '../../entities/ChessBoard'
import { getLegalMoves, getLegalMovesForColor } from '../moveGenerator'
import { isInCheck, isCheckmate } from '../checkDetector'
import type { ChessGameState } from '../../entities/ChessGameState'
import type { ChessBoard } from '../../entities/ChessBoard'
import type { Square } from '../../entities/Square'

// ---------------------------------------------------------------------------
// Helper: build a minimal game state from a board
// ---------------------------------------------------------------------------
function makeState(
  board: ChessBoard,
  overrides: Partial<ChessGameState> = {},
): ChessGameState {
  return {
    board,
    currentPlayer: 'white',
    moves: [],
    status: 'playing',
    winner: null,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    ...overrides,
  }
}

function sqSet(squares: Square[]): string[] {
  return squares.map(s => `${s.row},${s.col}`).sort()
}

const emptyBoard: ChessBoard = Array.from({ length: 8 }, () => Array(8).fill(null))

// ---------------------------------------------------------------------------
// 1. Initial board has correct piece placement
// ---------------------------------------------------------------------------
describe('createInitialBoard', () => {
  it('places 32 pieces (16 per side)', () => {
    const board = createInitialBoard()
    let total = 0
    let white = 0
    let black = 0
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c]
        if (p) { total++; p.color === 'white' ? white++ : black++ }
      }
    }
    expect(total).toBe(32)
    expect(white).toBe(16)
    expect(black).toBe(16)
  })

  it('places white king at e1 (row 7, col 4)', () => {
    const board = createInitialBoard()
    const king = getPiece(board, { row: 7, col: 4 })
    expect(king?.type).toBe('king')
    expect(king?.color).toBe('white')
  })

  it('places black king at e8 (row 0, col 4)', () => {
    const board = createInitialBoard()
    const king = getPiece(board, { row: 0, col: 4 })
    expect(king?.type).toBe('king')
    expect(king?.color).toBe('black')
  })
})

// ---------------------------------------------------------------------------
// 2. White pawn on e2 can move to e3 and e4 on first move
// ---------------------------------------------------------------------------
describe('white pawn on e2', () => {
  it('can move to e3 (row 5) and e4 (row 4)', () => {
    const board = createInitialBoard()
    const state = makeState(board)
    // e2 = row 6, col 4
    const moves = getLegalMoves(board, { row: 6, col: 4 }, state)
    const targets = sqSet(moves)
    expect(targets).toContain('5,4') // e3
    expect(targets).toContain('4,4') // e4
    expect(moves.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// 3. Knight on b1 can jump to a3 and c3
// ---------------------------------------------------------------------------
describe('white knight on b1', () => {
  it('can jump to a3 (row 5, col 0) and c3 (row 5, col 2)', () => {
    const board = createInitialBoard()
    const state = makeState(board)
    // b1 = row 7, col 1
    const moves = getLegalMoves(board, { row: 7, col: 1 }, state)
    const targets = sqSet(moves)
    // a3 = row 5, col 0; c3 = row 5, col 2
    expect(targets).toContain('5,0')
    expect(targets).toContain('5,2')
    expect(moves.length).toBe(2) // only 2 legal jumps from starting position
  })
})

// ---------------------------------------------------------------------------
// 4. King in checkmate has 0 legal moves
// ---------------------------------------------------------------------------
describe('checkmate detection', () => {
  it('a mated king has 0 legal moves', () => {
    // Black king at a8 (0,0), white queen at b6 (2,1), white king at h1 (7,7)
    // Queen on b6 covers: a7(1,0) diagonally and b8(0,1) and a5 etc.
    // Add white rook at c2 to cover any remaining escape:
    // With queen at b6: attacks (1,0)=a7, (0,1)=b8, (1,2), (3,0)...
    // Black king on a8 (0,0): adjacent squares are (0,1)=b8 and (1,0)=a7 and (1,1)=b7
    // Queen at (2,1) attacks (1,0), (0,1) via diagonals and files — need to verify b7
    // Add a rook at (1,2) = c7 to block escape to b7 via covering row 1
    let b = setPiece(emptyBoard, { row: 0, col: 0 }, { type: 'king', color: 'black', hasMoved: true })
    b = setPiece(b, { row: 2, col: 1 }, { type: 'queen', color: 'white', hasMoved: true })
    b = setPiece(b, { row: 7, col: 7 }, { type: 'king', color: 'white', hasMoved: true })
    // Rook at c7 (1,2) covers entire row 1 => blocks a7 and b7
    b = setPiece(b, { row: 1, col: 7 }, { type: 'rook', color: 'white', hasMoved: true })

    void makeState(b, { currentPlayer: 'black', status: 'check' })
    // If not actually in check, verify with a position that IS checkmate
    // Queen at (2,1): attacks (1,0) diag, (0,1) diag(2 steps? no — (1,0) is 1 step, (0,1) 2 steps diagonal from (2,1))
    // Actually (2,1) -> diagonals: (1,0), (1,2), (3,0), (3,2); also (0,1) would be distance 2 diagonally
    // Rook at (1,7) covers row 1 entirely
    // King at (0,0): can go to (0,1) [queen covers via 2-step diagonal? let's check]
    // From (2,1) queen diagonals: northeast = (1,2),(0,3); northwest = (1,0),(0,-1 invalid); etc
    // (0,1) is NOT covered by queen at (2,1) diagonally (diff=(2,0) = not diagonal)
    // But queen at (2,1): file b coverage = (1,1),(0,1) — yes! Queen covers col 1 vertically
    // So (0,1)=b8 is covered by queen (vertical). (1,0)=a7 is covered by rook at (1,7) (horizontal).
    // (1,1)=b7 is covered by both queen (vertical) and rook (horizontal).
    // King at (0,0) is in check from queen? Queen at (2,1): does it attack (0,0)?
    // Diagonals from (2,1): NW = (1,0), (0,-1 invalid). So (1,0) is attacked. Not (0,0) directly.
    // Files: col 1 = (1,1),(0,1). Not (0,0).
    // So king is NOT in check from queen here.
    // Let's use a simpler proven checkmate: king at a8, rooks on b6 and h7
    b = setPiece(emptyBoard, { row: 0, col: 0 }, { type: 'king', color: 'black', hasMoved: true })
    b = setPiece(b, { row: 2, col: 1 }, { type: 'rook', color: 'white', hasMoved: true }) // b6
    b = setPiece(b, { row: 1, col: 7 }, { type: 'rook', color: 'white', hasMoved: true }) // h7
    b = setPiece(b, { row: 7, col: 7 }, { type: 'king', color: 'white', hasMoved: true }) // h1

    // Rook on h7 (1,7) covers entire row 1 (a7..h7) => black king can't go to a7 (1,0)
    // Rook on b6 (2,1) covers col b => black king can't go to b8 (0,1)
    // Black king at a8 (0,0): adjacent = a7(1,0) blocked by rook-row, b8(0,1) blocked by rook-col, b7(1,1) blocked by both rooks
    // Black king IS in check from rook on b6 via col b? No, (0,0) is col 0, rook is col 1.
    // Is king in check? Rook on (2,1): covers col 1 (rows 0,1,3,4...) and row 2. King at (0,0) not on col 1 or row 2.
    // Rook on (1,7): covers row 1 (all cols) and col 7. King at (0,0) not on row 1 or col 7.
    // King not in check! We need to put it in check AND have no escape.
    // Back to the queen approach, verified:
    // Queen at (1,1)=b7 attacks (0,0)=a8 diagonally (1 step NW). King is in check.
    // Adjacent squares for king at (0,0): (0,1)=b8 and (1,0)=a7 and (1,1)=b7(occupied by queen).
    // Can king capture queen? (1,1) — is (1,1) defended? If white king is at (2,2), yes.
    b = setPiece(emptyBoard, { row: 0, col: 0 }, { type: 'king', color: 'black', hasMoved: true })
    b = setPiece(b, { row: 1, col: 1 }, { type: 'queen', color: 'white', hasMoved: true }) // b7
    b = setPiece(b, { row: 2, col: 2 }, { type: 'king', color: 'white', hasMoved: true }) // c6
    // Rook at a6 (2,0) covers col a => no a7 escape
    b = setPiece(b, { row: 2, col: 0 }, { type: 'rook', color: 'white', hasMoved: true }) // a6

    // Now: king at a8 is attacked by queen on b7 (diagonal). In check.
    // (0,1)=b8: attacked by queen (same row). Blocked.
    // (1,0)=a7: attacked by rook on a6 (same col). Blocked.
    // (1,1)=b7: queen is there, but can king capture? King at (1,1) would be attacked by white king at (2,2) — yes.
    // All escapes blocked → checkmate!
    const finalState: ChessGameState = makeState(b, { currentPlayer: 'black', status: 'check' })
    expect(isInCheck(b, 'black')).toBe(true)
    const legalMoves = getLegalMovesForColor(finalState)
    expect(legalMoves.length).toBe(0)
    expect(isCheckmate(finalState)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 5. Castling — only allowed when king/rook unmoved and path clear
// ---------------------------------------------------------------------------
describe('castling', () => {
  it('white can castle kingside when path is clear and pieces unmoved', () => {
    const board = createInitialBoard()
    // Clear f1 (7,5) and g1 (7,6)
    let b = setPiece(board, { row: 7, col: 5 }, null) // clear bishop f1
    b = setPiece(b, { row: 7, col: 6 }, null) // clear knight g1

    const state = makeState(b)
    const kingMoves = getLegalMoves(b, { row: 7, col: 4 }, state)
    const targets = sqSet(kingMoves)
    // g1 = (7,6) should be a legal castling destination
    expect(targets).toContain('7,6')
  })

  it('white CANNOT castle kingside when rook has moved', () => {
    const board = createInitialBoard()
    let b = setPiece(board, { row: 7, col: 5 }, null)
    b = setPiece(b, { row: 7, col: 6 }, null)
    // Mark the kingside rook as having moved
    const rook = getPiece(b, { row: 7, col: 7 })
    if (rook) b = setPiece(b, { row: 7, col: 7 }, { ...rook, hasMoved: true })

    const state = makeState(b)
    const kingMoves = getLegalMoves(b, { row: 7, col: 4 }, state)
    const targets = sqSet(kingMoves)
    // g1 should NOT be available
    expect(targets).not.toContain('7,6')
  })
})
