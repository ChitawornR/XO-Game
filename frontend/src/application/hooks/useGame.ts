import { useReducer, useCallback } from 'react'
import type { GameState, GameStatus } from '../../domain/entities/GameState'
import type { Player } from '../../domain/entities/Player'
import type { ReplayApi } from '../ports/ReplayApi'
import { createEmptyBoard } from '../../domain/services/boardOps'
import { streakFor } from '../../domain/rules/streak'
import { playMove } from '../use-cases/PlayMove'
import { saveReplay } from '../use-cases/SaveReplay'
import { GreedyBot } from '../../domain/services/bots/GreedyBot'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type State = GameState & {
  /** Set after game ends so the Popup can display the result. */
  notification: { type: 'won'; winner: Player } | { type: 'draw' } | null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'PLACE'; row: number; col: number }
  | { type: 'DISMISS_NOTIFICATION' }
  | { type: 'RESET' }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const bot = new GreedyBot()

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
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PLACE': {
      if (state.status !== 'playing') return state
      if (state.board[action.row][action.col] !== '') return state

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
        }
      }

      if (playerResult.isDraw) {
        return {
          ...state,
          board: playerResult.board,
          moves: playerResult.moves,
          status: 'draw',
          notification: { type: 'draw' },
        }
      }

      const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X'

      // --- Bot move (single-player, bot is always 'O') ---
      if (state.isSinglePlayer && nextPlayer === 'O') {
        const botMoveCoord = bot.decide(playerResult.board, state.streak, 'O')
        if (!botMoveCoord) {
          // Board full after player move (draw)
          return {
            ...state,
            board: playerResult.board,
            moves: playerResult.moves,
            currentPlayer: nextPlayer,
            status: 'draw',
            notification: { type: 'draw' },
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
          }
        }

        if (botResult.isDraw) {
          return {
            ...state,
            board: botResult.board,
            moves: botResult.moves,
            status: 'draw',
            notification: { type: 'draw' },
          }
        }

        return {
          ...state,
          board: botResult.board,
          moves: botResult.moves,
          currentPlayer: 'X', // back to player after bot move
        }
      }

      // --- Multiplayer: just switch turns ---
      return {
        ...state,
        board: playerResult.board,
        moves: playerResult.moves,
        currentPlayer: nextPlayer,
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
}

export function useGame(size: number, isSinglePlayer: boolean): UseGameReturn {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => buildInitialState(size, isSinglePlayer),
  )

  const placeCell = useCallback(
    (row: number, col: number) => dispatch({ type: 'PLACE', row, col }),
    [],
  )

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const dismissNotification = useCallback(
    () => dispatch({ type: 'DISMISS_NOTIFICATION' }),
    [],
  )

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

  return { state, placeCell, reset, dismissNotification, persistReplay }
}
