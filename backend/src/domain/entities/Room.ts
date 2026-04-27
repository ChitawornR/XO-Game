import type { Board } from './Board';
import type { Player } from './Player';
import type { Move } from './Move';

export type RoomStatus = 'waiting' | 'playing' | 'ended';

export type RoomPlayer = {
  socketId: string;
  username: string;
  userId: string;
  mark: Player;
};

export type Room = {
  code: string;
  size: number;
  streak: number;
  players: RoomPlayer[];
  board: Board;
  currentPlayer: Player;
  moves: Move[];
  status: RoomStatus;
  winner: Player | null;
};
