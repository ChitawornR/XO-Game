import type { Move } from '../../domain/entities/Move'
import type { Player } from '../../domain/entities/Player'

export type ReplayRecord = {
  id: string
  size: number
  winner: Player | null
  moves: Move[]
  isSinglePlayer: boolean
  isOnline: boolean
  createdAt: string
}

export type CreateReplayPayload = {
  size: number
  winner: Player | null
  moves: Move[]
  isSinglePlayer: boolean
}

/**
 * Port (interface) for replay persistence.
 * Infrastructure layer provides the concrete implementation.
 */
export interface ReplayApi {
  save(payload: CreateReplayPayload): Promise<void>
  list(): Promise<ReplayRecord[]>
  getById(id: string): Promise<ReplayRecord>
  delete(id: string): Promise<void>
}
