import { useEffect, useRef, useState, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import type { Board } from '../../domain/entities/Board'
import type { Player } from '../../domain/entities/Player'
import type { Move } from '../../domain/entities/Move'
import type { GameStatus } from '../../domain/entities/GameState'

export type OnlinePhase =
  | { type: 'idle' }
  | { type: 'waiting'; code: string }
  | { type: 'joining' }
  | { type: 'playing'; code: string; myMark: Player; opponentUsername: string }
  | { type: 'ended'; reason: 'won' | 'draw' | 'opponent-disconnected' }

export type OnlineGameState = {
  board: Board
  currentPlayer: Player
  moves: Move[]
  status: GameStatus
  winner: Player | null
  size: number
}

export function useOnlineGame(socket: Socket) {
  const [phase, setPhase] = useState<OnlinePhase>({ type: 'idle' })
  const [gameState, setGameState] = useState<OnlineGameState | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const myMarkRef = useRef<Player | null>(null)

  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.on('room-created', ({ code }: { code: string }) => {
      myMarkRef.current = 'X'
      setPhase({ type: 'waiting', code })
    })

    socket.on('opponent-joined', ({ opponentUsername }: { opponentUsername: string }) => {
      setPhase((prev) => {
        if (prev.type !== 'waiting') return prev
        return { type: 'playing', code: prev.code, myMark: 'X', opponentUsername }
      })
    })

    socket.on(
      'room-joined',
      ({ code, opponentUsername }: { code: string; size: number; myMark: Player; opponentUsername: string }) => {
        myMarkRef.current = 'O'
        setPhase({ type: 'playing', code, myMark: 'O', opponentUsername })
      },
    )

    socket.on(
      'game-updated',
      (data: {
        board: Board
        currentPlayer: Player
        status: string
        winner: Player | null
        moves: Move[]
      }) => {
        setGameState({
          board: data.board,
          currentPlayer: data.currentPlayer,
          moves: data.moves,
          status: data.status as GameStatus,
          winner: data.winner,
          size: data.board.length,
        })
        if (data.status === 'ended') {
          setPhase({ type: 'ended', reason: data.winner ? 'won' : 'draw' })
        }
      },
    )

    socket.on('opponent-disconnected', () => {
      setPhase({ type: 'ended', reason: 'opponent-disconnected' })
    })

    socket.on('error', ({ message }: { message: string }) => {
      console.error('[socket error]', message)
      setErrorMsg(message)
      setPhase((prev) => (prev.type === 'joining' ? { type: 'idle' } : prev))
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [socket])

  const createRoom = useCallback(
    (size: number) => {
      setErrorMsg(null)
      socket.emit('create-room', { size })
    },
    [socket],
  )

  const joinRoom = useCallback(
    (code: string) => {
      setErrorMsg(null)
      setPhase({ type: 'joining' })
      socket.emit('join-room', { code })
    },
    [socket],
  )

  const placeCell = useCallback(
    (row: number, col: number) => {
      if (phase.type !== 'playing') return
      if (gameState?.currentPlayer !== myMarkRef.current) return
      socket.emit('place-move', { row, col })
    },
    [socket, phase, gameState],
  )

  return {
    phase,
    gameState,
    myMark: myMarkRef.current,
    errorMsg,
    createRoom,
    joinRoom,
    placeCell,
  }
}
