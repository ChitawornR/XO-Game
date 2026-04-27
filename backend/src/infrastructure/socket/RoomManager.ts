import type { Room } from '../../domain/entities/Room';
import { createEmptyBoard } from '../../domain/services/BoardOps';
import { streakFor } from '../../domain/services/streakFor';

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  create(socketId: string, username: string, size: number): Room {
    let code = generateCode();
    while (this.rooms.has(code)) code = generateCode();

    const room: Room = {
      code,
      size,
      streak: streakFor(size),
      players: [{ socketId, username, mark: 'X' }],
      board: createEmptyBoard(size),
      currentPlayer: 'X',
      moves: [],
      status: 'waiting',
      winner: null,
    };

    this.rooms.set(code, room);
    return room;
  }

  join(socketId: string, username: string, code: string): Room | null {
    const room = this.rooms.get(code);
    if (!room || room.status !== 'waiting' || room.players.length >= 2) return null;

    room.players.push({ socketId, username, mark: 'O' });
    room.status = 'playing';
    return room;
  }

  getByCode(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p) => p.socketId === socketId)) return room;
    }
    return undefined;
  }

  remove(code: string): void {
    this.rooms.delete(code);
  }
}
