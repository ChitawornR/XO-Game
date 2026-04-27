import type { Board } from '../entities/Board';
import type { Player } from '../entities/Player';

export function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<string>(size).fill('') as Board[0]);
}

export function placeMove(board: Board, row: number, col: number, player: Player): Board {
  return board.map((r, i) => r.map((cell, j) => (i === row && j === col ? player : cell))) as Board;
}

export function isBoardFull(board: Board): boolean {
  return board.flat().every((cell) => cell !== '');
}
