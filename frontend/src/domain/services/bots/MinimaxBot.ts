import type { Board } from '../../entities/Board'
import type { Player } from '../../entities/Player'
import type { BotMove, BotStrategy } from './BotStrategy'
import { findWinner } from '../winnerChecker'
import { placeMove, isBoardFull } from '../boardOps'

/**
 * MinimaxBot — Minimax search with alpha-beta pruning and a sliding-window
 * heuristic for non-terminal evaluation.
 *
 * Depth is adaptive to board size to keep response time interactive:
 *   3×3 → 9 (full search), 4×4 → 5, 5×5 → 4, 6×6+ → 3
 *
 * The bot can be customised by passing { maxDepth } to the constructor.
 */
export class MinimaxBot implements BotStrategy {
  private readonly maxDepth?: number

  constructor(opts: { maxDepth?: number } = {}) {
    this.maxDepth = opts.maxDepth
  }

  decide(board: Board, streak: number, player: Player): BotMove | null {
    const size = board.length
    if (isBoardFull(board)) return null

    // Optimisation: first move on an empty board → take the centre.
    if (board.flat().every((c) => c === '')) {
      const c = Math.floor(size / 2)
      return { row: c, col: c }
    }

    const depth = this.maxDepth ?? this.defaultDepthFor(size)
    const opponent: Player = player === 'X' ? 'O' : 'X'

    let bestScore = -Infinity
    let bestMove: BotMove | null = null
    let alpha = -Infinity
    const beta = Infinity

    for (const move of this.orderedMoves(board, size)) {
      const next = placeMove(board, move.row, move.col, player)
      const score = this.minimax(next, streak, opponent, player, depth - 1, alpha, beta, false)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
      if (bestScore > alpha) alpha = bestScore
      if (beta <= alpha) break
    }

    return bestMove
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private defaultDepthFor(size: number): number {
    if (size <= 3) return 9
    if (size === 4) return 5
    if (size === 5) return 4
    return 3
  }

  /**
   * Negamax-flavoured minimax that returns scores from the perspective of
   * `maximizingPlayer`.
   */
  private minimax(
    board: Board,
    streak: number,
    currentPlayer: Player,
    maximizingPlayer: Player,
    depth: number,
    alpha: number,
    beta: number,
    isMax: boolean,
  ): number {
    const winner = findWinner(board, streak)
    if (winner === maximizingPlayer) return 100_000 + depth // prefer faster wins
    if (winner !== null) return -100_000 - depth // prefer slower losses
    if (isBoardFull(board)) return 0 // draw
    if (depth === 0) return this.evaluate(board, streak, maximizingPlayer)

    const size = board.length
    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X'

    if (isMax) {
      let value = -Infinity
      for (const m of this.orderedMoves(board, size)) {
        const nb = placeMove(board, m.row, m.col, currentPlayer)
        const v = this.minimax(nb, streak, opponent, maximizingPlayer, depth - 1, alpha, beta, false)
        if (v > value) value = v
        if (value > alpha) alpha = value
        if (beta <= alpha) break
      }
      return value
    } else {
      let value = Infinity
      for (const m of this.orderedMoves(board, size)) {
        const nb = placeMove(board, m.row, m.col, currentPlayer)
        const v = this.minimax(nb, streak, opponent, maximizingPlayer, depth - 1, alpha, beta, true)
        if (v < value) value = v
        if (value < beta) beta = value
        if (beta <= alpha) break
      }
      return value
    }
  }

  /**
   * Sliding-window heuristic — for every window of length `streak` on the
   * board, score open windows toward the maximiser positively and toward
   * the opponent negatively. Closed (mixed) windows are worthless.
   */
  private evaluate(board: Board, streak: number, player: Player): number {
    const opponent: Player = player === 'X' ? 'O' : 'X'
    let score = 0
    for (const win of this.windows(board, streak)) {
      let p = 0
      let o = 0
      for (const c of win) {
        if (c === player) p++
        else if (c === opponent) o++
      }
      if (p > 0 && o > 0) continue
      if (p > 0) score += 10 ** p
      if (o > 0) score -= 10 ** o
    }
    return score
  }

  /**
   * Yield every length-`streak` window across rows, columns, and both
   * diagonals as an array of cell values.
   */
  private *windows(board: Board, streak: number): Generator<string[]> {
    const size = board.length
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - streak; c++) {
        const w: string[] = []
        for (let i = 0; i < streak; i++) w.push(board[r][c + i])
        yield w
      }
    }
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - streak; r++) {
        const w: string[] = []
        for (let i = 0; i < streak; i++) w.push(board[r + i][c])
        yield w
      }
    }
    for (let r = 0; r <= size - streak; r++) {
      for (let c = 0; c <= size - streak; c++) {
        const w: string[] = []
        for (let i = 0; i < streak; i++) w.push(board[r + i][c + i])
        yield w
      }
    }
    for (let r = 0; r <= size - streak; r++) {
      for (let c = streak - 1; c < size; c++) {
        const w: string[] = []
        for (let i = 0; i < streak; i++) w.push(board[r + i][c - i])
        yield w
      }
    }
  }

  /**
   * Order candidate moves from centre outward for better alpha-beta cuts.
   */
  private orderedMoves(board: Board, size: number): BotMove[] {
    const center = (size - 1) / 2
    const moves: BotMove[] = []
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') moves.push({ row, col })
      }
    }
    moves.sort((a, b) => {
      const da = Math.abs(a.row - center) + Math.abs(a.col - center)
      const db = Math.abs(b.row - center) + Math.abs(b.col - center)
      return da - db
    })
    return moves
  }
}
