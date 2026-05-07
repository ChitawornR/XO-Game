/**
 * useChessGame — application-layer hook for the chess feature.
 *
 * Pattern mirrors useGame.ts (useReducer-based, pure domain layer, bot via ref).
 * All chess logic lives in the domain layer; this hook is thin orchestration.
 */

import { useReducer, useCallback, useRef, useEffect } from 'react'
import type { ChessGameState } from '../../domain/chess/entities/ChessGameState'
import type { ChessMove } from '../../domain/chess/entities/ChessMove'
import type { Square } from '../../domain/chess/entities/Square'
import type { Color } from '../../domain/chess/entities/Piece'
import { createInitialBoard } from '../../domain/chess/entities/ChessBoard'
import { getPiece } from '../../domain/chess/entities/ChessBoard'
import { squareEquals } from '../../domain/chess/entities/Square'
import { getLegalMoves } from '../../domain/chess/services/moveGenerator'
import { applyMove, detectCastle } from '../../domain/chess/services/boardOps'
import { makeChessBot, type ChessDifficulty } from '../../domain/chess/services/bots'
import type { ChessBotStrategy } from '../../domain/chess/services/bots/ChessBotStrategy'

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

function buildInitialChessState(): ChessGameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    moves: [],
    status: 'playing',
    winner: null,
    enPassantTarget: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
  }
}

// ---------------------------------------------------------------------------
// UI-level hook state (extends ChessGameState with selection + notification)
// ---------------------------------------------------------------------------

type Notification =
  | { type: 'checkmate'; winner: Color }
  | { type: 'stalemate' }
  | { type: 'draw' }
  | null

type HookState = {
  game: ChessGameState
  selectedSquare: Square | null
  legalMovesForSelected: Square[]
  notification: Notification
  /** Set when a pawn reaches the back rank — stores the pending move awaiting promotion choice. */
  promotionPending: { from: Square; to: Square } | null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SELECT'; square: Square }
  | { type: 'MOVE'; move: ChessMove }
  | { type: 'BOT_MOVE'; move: ChessMove }
  | { type: 'DISMISS_NOTIFICATION' }
  | { type: 'RESET' }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: HookState, action: Action): HookState {
  switch (action.type) {
    case 'SELECT': {
      const { game } = state
      const { square } = action

      if (game.status !== 'playing' && game.status !== 'check') return state

      const piece = getPiece(game.board, square)

      // If a piece is already selected, check if this is a legal move destination
      if (state.selectedSquare) {
        const isLegalTarget = state.legalMovesForSelected.some(sq =>
          squareEquals(sq, square),
        )

        if (isLegalTarget) {
          // Build the move and check for promotion
          const movingPiece = getPiece(game.board, state.selectedSquare)
          if (!movingPiece) return state

          const backRank = movingPiece.color === 'white' ? 0 : 7
          const isPromotion =
            movingPiece.type === 'pawn' && square.row === backRank

          if (isPromotion) {
            // Auto-promote to queen (see report for rationale)
            const captured = game.board[square.row][square.col]
            const move: ChessMove = {
              from: state.selectedSquare,
              to: square,
              piece: movingPiece,
              captured: captured ?? null,
              promotion: 'queen',
              at: new Date().toISOString(),
            }
            const newGame = applyMove(game, move)
            return {
              ...state,
              game: newGame,
              selectedSquare: null,
              legalMovesForSelected: [],
              promotionPending: null,
              notification: buildNotification(newGame),
            }
          }

          const captured = game.board[square.row][square.col]
          const isEnPassant =
            movingPiece.type === 'pawn' &&
            game.enPassantTarget !== null &&
            squareEquals(square, game.enPassantTarget)

          const castleSide =
            movingPiece.type === 'king'
              ? detectCastle(state.selectedSquare, square)
              : undefined

          const enPassantCapture =
            isEnPassant && game.enPassantTarget
              ? game.board[
                  movingPiece.color === 'white'
                    ? square.row + 1
                    : square.row - 1
                ][square.col]
              : null

          const move: ChessMove = {
            from: state.selectedSquare,
            to: square,
            piece: movingPiece,
            captured: isEnPassant ? enPassantCapture : (captured ?? null),
            isCastle: castleSide,
            isEnPassant: isEnPassant || undefined,
            at: new Date().toISOString(),
          }

          const newGame = applyMove(game, move)
          return {
            ...state,
            game: newGame,
            selectedSquare: null,
            legalMovesForSelected: [],
            promotionPending: null,
            notification: buildNotification(newGame),
          }
        }

        // Clicked same piece — deselect
        if (piece && squareEquals(square, state.selectedSquare)) {
          return { ...state, selectedSquare: null, legalMovesForSelected: [] }
        }
      }

      // Clicked a different own piece — select it
      if (piece && piece.color === game.currentPlayer) {
        const legal = getLegalMoves(game.board, square, game)
        return {
          ...state,
          selectedSquare: square,
          legalMovesForSelected: legal,
        }
      }

      // Clicked empty or opponent piece with nothing selected — deselect
      return { ...state, selectedSquare: null, legalMovesForSelected: [] }
    }

    case 'MOVE': {
      // Programmatic move (used by bot)
      const newGame = applyMove(state.game, action.move)
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMovesForSelected: [],
        promotionPending: null,
        notification: buildNotification(newGame),
      }
    }

    case 'BOT_MOVE': {
      if (state.game.status !== 'playing' && state.game.status !== 'check') return state
      const newGame = applyMove(state.game, action.move)
      return {
        ...state,
        game: newGame,
        selectedSquare: null,
        legalMovesForSelected: [],
        promotionPending: null,
        notification: buildNotification(newGame),
      }
    }

    case 'DISMISS_NOTIFICATION':
      return { ...state, notification: null }

    case 'RESET':
      return buildInitialHookState()

    default:
      return state
  }
}

function buildNotification(game: ChessGameState): Notification {
  if (game.status === 'checkmate' && game.winner) {
    return { type: 'checkmate', winner: game.winner }
  }
  if (game.status === 'stalemate') return { type: 'stalemate' }
  if (game.status === 'draw') return { type: 'draw' }
  return null
}

function buildInitialHookState(): HookState {
  return {
    game: buildInitialChessState(),
    selectedSquare: null,
    legalMovesForSelected: [],
    notification: null,
    promotionPending: null,
  }
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export type UseChessGameReturn = {
  state: ChessGameState
  selectedSquare: Square | null
  legalMovesForSelected: Square[]
  notification: Notification
  promotionPending: { from: Square; to: Square } | null
  isSinglePlayer: boolean
  selectSquare: (sq: Square) => void
  makeMove: (move: ChessMove) => void
  reset: () => void
  dismissNotification: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChessGame(
  isSinglePlayer: boolean,
  difficulty: ChessDifficulty = 'easy',
): UseChessGameReturn {
  const [hookState, dispatch] = useReducer(
    reducer,
    undefined,
    buildInitialHookState,
  )

  // Stable bot instance
  const botRef = useRef<ChessBotStrategy | null>(null)
  if (botRef.current === null && isSinglePlayer) {
    botRef.current = makeChessBot(difficulty)
  }

  // ---------------------------------------------------------------------------
  // Bot effect: after player (white) moves, trigger bot (black) with a delay
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSinglePlayer) return
    if (hookState.game.currentPlayer !== 'black') return
    if (hookState.game.status !== 'playing' && hookState.game.status !== 'check') return

    const bot = botRef.current
    if (!bot) return

    const timerId = setTimeout(() => {
      const botMove = bot.decide(hookState.game)
      if (botMove) {
        dispatch({ type: 'BOT_MOVE', move: botMove })
      }
    }, 300)

    return () => clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookState.game.currentPlayer, hookState.game.moves.length, isSinglePlayer])

  const selectSquare = useCallback((sq: Square) => {
    dispatch({ type: 'SELECT', square: sq })
  }, [])

  const makeMove = useCallback((move: ChessMove) => {
    dispatch({ type: 'MOVE', move })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const dismissNotification = useCallback(
    () => dispatch({ type: 'DISMISS_NOTIFICATION' }),
    [],
  )

  return {
    state: hookState.game,
    selectedSquare: hookState.selectedSquare,
    legalMovesForSelected: hookState.legalMovesForSelected,
    notification: hookState.notification,
    promotionPending: hookState.promotionPending,
    isSinglePlayer,
    selectSquare,
    makeMove,
    reset,
    dismissNotification,
  }
}
