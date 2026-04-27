import { describe, it, expect } from 'vitest';
import { createReplay } from '../Replay';
import { DomainError } from '../../errors/DomainError';

const validInput = {
  size: 3,
  winner: 'X' as const,
  moves: [
    { row: 0, col: 0, player: 'X' as const },
    { row: 1, col: 1, player: 'O' as const },
    { row: 0, col: 1, player: 'X' as const },
  ],
  isSinglePlayer: false,
};

describe('createReplay', () => {
  it('creates a valid replay with correct shape', () => {
    const replay = createReplay(validInput);

    expect(replay.size).toBe(3);
    expect(replay.winner).toBe('X');
    expect(replay.moves).toHaveLength(3);
    expect(replay.isSinglePlayer).toBe(false);
    expect(replay.createdAt).toBeInstanceOf(Date);
  });

  it('allows winner to be null (draw)', () => {
    const replay = createReplay({ ...validInput, winner: null });
    expect(replay.winner).toBeNull();
  });

  it('normalises move.at from ISO string to Date', () => {
    const replay = createReplay({
      ...validInput,
      moves: [
        { row: 0, col: 0, player: 'X', at: '2026-04-27T10:00:00.000Z' },
        { row: 1, col: 1, player: 'O' }, // no `at`
      ],
    });
    expect(replay.moves[0].at).toBeInstanceOf(Date);
    expect((replay.moves[0].at as Date).toISOString()).toBe(
      '2026-04-27T10:00:00.000Z',
    );
    expect(replay.moves[1].at).toBeUndefined();
  });

  it('rejects an invalid move.at value', () => {
    expect(() =>
      createReplay({
        ...validInput,
        moves: [{ row: 0, col: 0, player: 'X', at: 'not-a-date' }],
      }),
    ).toThrow(DomainError);
  });

  it('works with isSinglePlayer = true', () => {
    const replay = createReplay({ ...validInput, isSinglePlayer: true });
    expect(replay.isSinglePlayer).toBe(true);
  });

  it('throws DomainError when size < 3', () => {
    expect(() => createReplay({ ...validInput, size: 2 })).toThrow(DomainError);
  });

  it('throws DomainError when size > 10', () => {
    expect(() => createReplay({ ...validInput, size: 11 })).toThrow(DomainError);
  });

  it('throws DomainError when size is not an integer', () => {
    expect(() => createReplay({ ...validInput, size: 3.5 })).toThrow(DomainError);
  });

  it('throws DomainError when moves array is empty', () => {
    expect(() => createReplay({ ...validInput, moves: [] })).toThrow(DomainError);
  });

  it('throws DomainError when a move is out of bounds (row >= size)', () => {
    const badMoves = [{ row: 3, col: 0, player: 'X' as const }];
    expect(() => createReplay({ ...validInput, moves: badMoves })).toThrow(DomainError);
  });

  it('throws DomainError when a move has a negative col', () => {
    const badMoves = [{ row: 0, col: -1, player: 'X' as const }];
    expect(() => createReplay({ ...validInput, moves: badMoves })).toThrow(DomainError);
  });

  it('does not include an id field', () => {
    const replay = createReplay(validInput);
    expect((replay as { id?: unknown }).id).toBeUndefined();
  });
});
