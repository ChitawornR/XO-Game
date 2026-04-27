import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RoomManager } from './RoomManager';
import { placeMove, isBoardFull } from '../../domain/services/BoardOps';
import { findWinner } from '../../domain/services/WinnerChecker';
import type { AuthPayload } from '../web/middlewares/authenticate';

const manager = new RoomManager();

function getUser(socket: Socket): AuthPayload | null {
  try {
    const token = (socket.handshake.auth as { token?: string }).token;
    if (!token) return null;
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket) => {
    const user = getUser(socket);
    if (!user) {
      socket.emit('error', { message: 'Authentication required.' });
      socket.disconnect();
      return;
    }

    // ------------------------------------------------------------------ create-room
    socket.on('create-room', ({ size }: { size: number }) => {
      if (!Number.isInteger(size) || size < 3 || size > 10) {
        socket.emit('error', { message: 'Invalid board size.' });
        return;
      }
      const room = manager.create(socket.id, user.username, size);
      void socket.join(room.code);
      socket.emit('room-created', { code: room.code });
    });

    // ------------------------------------------------------------------ join-room
    socket.on('join-room', ({ code }: { code: string }) => {
      const room = manager.join(socket.id, user.username, code.toUpperCase());
      if (!room) {
        socket.emit('error', { message: 'Room not found or already full.' });
        return;
      }

      void socket.join(room.code);

      const host = room.players[0];
      const joiner = room.players[1];

      // Tell joiner their mark and game info
      socket.emit('room-joined', {
        code: room.code,
        size: room.size,
        myMark: 'O',
        opponentUsername: host.username,
      });

      // Tell host that opponent joined
      io.to(host.socketId).emit('opponent-joined', {
        opponentUsername: joiner.username,
      });

      // Emit initial game state so both clients can render an empty board
      io.to(room.code).emit('game-updated', {
        board: room.board,
        currentPlayer: room.currentPlayer,
        status: room.status,
        winner: room.winner,
        moves: room.moves,
      });
    });

    // ------------------------------------------------------------------ place-move
    socket.on('place-move', ({ row, col }: { row: number; col: number }) => {
      const room = manager.getBySocketId(socket.id);
      if (!room || room.status !== 'playing') return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player || player.mark !== room.currentPlayer) return;
      if (room.board[row]?.[col] !== '') return;

      room.board = placeMove(room.board, row, col, player.mark);
      room.moves.push({ row, col, player: player.mark });

      const winner = findWinner(room.board, room.streak);
      const draw = !winner && isBoardFull(room.board);

      if (winner) {
        room.status = 'ended';
        room.winner = winner;
      } else if (draw) {
        room.status = 'ended';
      } else {
        room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
      }

      io.to(room.code).emit('game-updated', {
        board: room.board,
        currentPlayer: room.currentPlayer,
        status: room.status,
        winner: room.winner,
        moves: room.moves,
      });

      if (room.status === 'ended') manager.remove(room.code);
    });

    // ------------------------------------------------------------------ disconnect
    socket.on('disconnect', () => {
      const room = manager.getBySocketId(socket.id);
      if (!room || room.status === 'ended') return;

      room.status = 'ended';
      manager.remove(room.code);

      // Notify the other player
      socket.to(room.code).emit('opponent-disconnected');
    });
  });
}
