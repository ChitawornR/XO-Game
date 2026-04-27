import { useEffect, useRef, useState, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import type { Board } from '../../domain/entities/Board'
import type { Player } from '../../domain/entities/Player'
import type { Move } from '../../domain/entities/Move'
import type { GameStatus } from '../../domain/entities/GameState'

// ---- Types mirroring server events ----

export type OnlinePhase =
  | { type: 'connecting' }
  | { type: 'waiting'; code: string }               // created, waiting for opponent
  | { type: 'joining' }                              // sent join-room, waiting for ack
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

// ---- Hook ----

export function useOnlineGame(socket: Socket, size: number) {
  const [phase, setPhase] = useState<OnlinePhase>({ type: 'connecting' })
  const [gameState, setGameState] = useState<OnlineGameState | null>(null)
  const myMarkRef = useRef<Player | null>(null)

  // Connect once on mount, cleanup on unmount
  useEffect(() => {
    if (!socket.connected) socket.connect()

    socket.on('connect', () => setPhase({ type: 'connecting' }))

    socket.on('room-created', ({ code }: { code: string }) => {
      setPhase({ type: 'waiting', code })
    })

    socket.on('opponent-joined', ({ opponentUsername }: { opponentUsername: string }) => {
      setPhase((prev) => {
        if (prev.type !== 'waiting') return prev
        myMarkRef.current = 'X'
        return { type: 'playing', code: prev.code, myMark: 'X', opponentUsername }
      })
    })

    socket.on(
      'room-joined',
      ({ code, opponentUsername }: { code: string; myMark: Player; opponentUsername: string }) => {
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
          size,
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
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [socket, size])

  const createRoom = useCallback(() => {
    socket.emit('create-room', { size })
  }, [socket, size])

  const joinRoom = useCallback(
    (code: string) => {
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

  return { phase, gameState, myMark: myMarkRef.current, createRoom, joinRoom, placeCell }
}
