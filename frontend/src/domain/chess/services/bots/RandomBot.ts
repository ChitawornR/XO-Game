import type { ChessBotStrategy } from './ChessBotStrategy'
import type { ChessGameState } from '../../entities/ChessGameState'
import type { ChessMove } from '../../entities/ChessMove'
import type { Square } from '../../entities/Square'
import { getPiece } from '../../entities/ChessBoard'
import { getLegalMoves } from '../moveGenerator'
import { detectCastle } from '../boardOps'

/**
 * RandomBot — picks a random legal move for the current player.
 * Acceptable for v1 easy difficulty.
 */
export class RandomBot implements ChessBotStrategy {
  decide(state: ChessGameState): ChessMove | null {
    const { board, currentPlayer, enPassantTarget } = state

    // Collect all legal moves as (from, to) pairs
    const candidates: { from: Square; to: Square }[] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (!piece || piece.color !== currentPlayer) continue

        const from: Square = { row, col }
        const targets = getLegalMoves(board, from, state)

        for (const to of targets) {
          candidates.push({ from, to })
        }
      }
    }

    if (candidates.length === 0) return null

    // Pick a random candidate
    const { from, to } = candidates[Math.floor(Math.random() * candidates.length)]
    const piece = getPiece(board, from)
    if (!piece) return null

    const captured = board[to.row][to.col]

    // En-passant
    const isEnPassant =
      piece.type === 'pawn' &&
      enPassantTarget !== null &&
      to.row === enPassantTarget.row &&
      to.col === enPassantTarget.col

    // Castling
    const castleSide =
      piece.type === 'king' ? detectCastle(from, to) : undefined

    // Promotion — always auto-queen for bot
    const backRank = piece.color === 'white' ? 0 : 7
    const isPromotion = piece.type === 'pawn' && to.row === backRank

    const move: ChessMove = {
      from,
      to,
      piece,
      captured: isEnPassant
        ? board[piece.color === 'white' ? to.row + 1 : to.row - 1][to.col]
        : (captured ?? null),
      promotion: isPromotion ? 'queen' : undefined,
      isCastle: castleSide,
      isEnPassant: isEnPassant || undefined,
      at: new Date().toISOString(),
    }

    return move
  }
}
