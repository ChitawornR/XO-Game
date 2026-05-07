import { useReducer, useCallback, useRef } from 'react'
import type { GameState, GameStatus } from '../../domain/entities/GameState'
import type { Player } from '../../domain/entities/Player'
import type { ReplayApi } from '../ports/ReplayApi'
import { createEmptyBoard } from '../../domain/services/boardOps'
import { streakFor } from '../../domain/rules/streak'
import { playMove } from '../use-cases/PlayMove'
import { saveReplay } from '../use-cases/SaveReplay'
import type { BotStrategy } from '../../domain/services/bots/BotStrategy'
import { makeBot, type Difficulty } from '../../domain/services/bots'
import type { Board } from '../../domain/entities/Board'
import type { Move } from '../../domain/entities/Move'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const MAX_HISTORY = 5

type GameSnapshot = {
  board: Board
  currentPlayer: Player
  moves: Move[]
  status: GameStatus
  winner: Player | null
  notification: { type: 'won'; winner: Player } | { type: 'draw' } | null
}

type State = GameState & {
  notification: { type: 'won'; winner: Player } | { type: 'draw' } | null
  past: GameSnapshot[]
  future: GameSnapshot[]
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'PLACE'; row: number; col: number; bot: BotStrategy | null }
  | { type: 'DISMISS_NOTIFICATION' }
  | { type: 'RESET' }
  | { type: 'UNDO' }
  | { type: 'REDO' }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function buildInitialState(size: number, isSinglePlayer: boolean): State {
  const streak = streakFor(size)
  return {
    board: createEmptyBoard(size),
    currentPlayer: 'X',
    moves: [],
    winner: null,
    status: 'playing' as GameStatus,
    isSinglePlayer,
    size,
    streak,
    notification: null,
    past: [],
    future: [],
  }
}

function snapshotOf(state: State): GameSnapshot {
  return {
    board: state.board,
    currentPlayer: state.currentPlayer,
    moves: state.moves,
    status: state.status,
    winner: state.winner,
    notification: state.notification,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PLACE': {
      if (state.status !== 'playing') return state
      if (state.board[action.row][action.col] !== '') return state

      // Save snapshot before the move (multiplayer only); clear redo stack
      const snapshot = snapshotOf(state)
      const newPast = state.isSinglePlayer
        ? state.past
        : [...state.past, snapshot].slice(-MAX_HISTORY)
      const newFuture: GameSnapshot[] = state.isSinglePlayer ? state.future : []

      // --- Player move ---
      const playerResult = playMove(
        state.board,
        state.moves,
        action.row,
        action.col,
        state.currentPlayer,
        state.streak,
      )

      if (playerResult.winner) {
        return {
          ...state,
          board: playerResult.board,
          moves: playerResult.moves,
          winner: playerResult.winner,
          status: 'won',
          notification: { type: 'won', winner: playerResult.winner },
          past: newPast,
          future: newFuture,
        }
      }

      if (playerResult.isDraw) {
        return {
          ...state,
          board: playerResult.board,
          moves: playerResult.moves,
          status: 'draw',
          notification: { type: 'draw' },
          past: newPast,
          future: newFuture,
        }
      }

      const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X'

      // --- Bot move (single-player, bot is always 'O') ---
      if (state.isSinglePlayer && nextPlayer === 'O' && action.bot) {
        const botMoveCoord = action.bot.decide(playerResult.board, state.streak, 'O')
        if (!botMoveCoord) {
          return {
            ...state,
            board: playerResult.board,
            moves: playerResult.moves,
            currentPlayer: nextPlayer,
            status: 'draw',
            notification: { type: 'draw' },
            past: newPast,
            future: newFuture,
          }
        }

        const botResult = playMove(
          playerResult.board,
          playerResult.moves,
          botMoveCoord.row,
          botMoveCoord.col,
          'O',
          state.streak,
        )

        if (botResult.winner) {
          return {
            ...state,
            board: botResult.board,
            moves: botResult.moves,
            winner: botResult.winner,
            status: 'won',
            notification: { type: 'won', winner: botResult.winner },
            past: newPast,
            future: newFuture,
          }
        }

        if (botResult.isDraw) {
          return {
            ...state,
            board: botResult.board,
            moves: botResult.moves,
            status: 'draw',
            notification: { type: 'draw' },
            past: newPast,
            future: newFuture,
          }
        }

        return {
          ...state,
          board: botResult.board,
          moves: botResult.moves,
          currentPlayer: 'X',
          past: newPast,
          future: newFuture,
        }
      }

      // --- Multiplayer: just switch turns ---
      return {
        ...state,
        board: playerResult.board,
        moves: playerResult.moves,
        currentPlayer: nextPlayer,
        past: newPast,
        future: newFuture,
      }
    }

    case 'UNDO': {
      if (state.isSinglePlayer || state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        ...state,
        ...previous,
        past: state.past.slice(0, -1),
        future: [snapshotOf(state), ...state.future],
      }
    }

    case 'REDO': {
      if (state.isSinglePlayer || state.future.length === 0) return state
      const next = state.future[0]
      return {
        ...state,
        ...next,
        past: [...state.past, snapshotOf(state)],
        future: state.future.slice(1),
      }
    }

    case 'DISMISS_NOTIFICATION':
      return { ...state, notification: null }

    case 'RESET':
      return buildInitialState(state.size, state.isSinglePlayer)

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type UseGameReturn = {
  state: State
  placeCell: (row: number, col: number) => void
  reset: () => void
  dismissNotification: () => void
  persistReplay: (api: ReplayApi) => Promise<void>
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useGame(
  size: number,
  isSinglePlayer: boolean,
  difficulty: Difficulty = 'easy',
): UseGameReturn {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => buildInitialState(size, isSinglePlayer),
  )

  // Stable bot instance for the lifetime of this game session.
  const botRef = useRef<BotStrategy | null>(null)
  if (botRef.current === null && isSinglePlayer) {
    botRef.current = makeBot(difficulty)
  }

  const placeCell = useCallback(
    (row: number, col: number) =>
      dispatch({ type: 'PLACE', row, col, bot: botRef.current }),
    [],
  )

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const dismissNotification = useCallback(
    () => dispatch({ type: 'DISMISS_NOTIFICATION' }),
    [],
  )

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])

  const persistReplay = useCallback(
    (api: ReplayApi) =>
      saveReplay(api, {
        size: state.size,
        winner: state.winner,
        moves: state.moves,
        isSinglePlayer: state.isSinglePlayer,
      }),
    [state.size, state.winner, state.moves, state.isSinglePlayer],
  )

  const canUndo = !isSinglePlayer && state.past.length > 0
  const canRedo = !isSinglePlayer && state.future.length > 0

  return { state, placeCell, reset, dismissNotification, persistReplay, undo, redo, canUndo, canRedo }
}
