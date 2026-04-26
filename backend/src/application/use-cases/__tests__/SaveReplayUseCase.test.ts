import { describe, it, expect, beforeEach } from 'vitest';
import { SaveReplayUseCase } from '../SaveReplayUseCase';
import { Replay } from '../../../domain/entities/Replay';
import { ReplayRepository } from '../../ports/ReplayRepository';
import { DomainError } from '../../../domain/errors/DomainError';

// --- In-memory fake repository ---
class InMemoryReplayRepository implements ReplayRepository {
  private store = new Map<string, Replay>();
  private nextId = 1;

  async save(replay: Omit<Replay, 'id'>): Promise<Replay> {
    const id = String(this.nextId++);
    const saved: Replay = { ...replay, id };
    this.store.set(id, saved);
    return saved;
  }

  async findAll(): Promise<Replay[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findById(id: string): Promise<Replay | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

// --- Tests ---
const validDTO = {
  size: 3,
  winner: 'X' as const,
  moves: [
    { row: 0, col: 0, player: 'X' as const },
    { row: 1, col: 1, player: 'O' as const },
    { row: 0, col: 1, player: 'X' as const },
  ],
  isSinglePlayer: false,
};

describe('SaveReplayUseCase', () => {
  let repo: InMemoryReplayRepository;
  let useCase: SaveReplayUseCase;

  beforeEach(() => {
    repo = new InMemoryReplayRepository();
    useCase = new SaveReplayUseCase(repo);
  });

  it('saves a valid replay and returns a DTO with an id', async () => {
    const result = await useCase.execute(validDTO);

    expect(result.id).toBeDefined();
    expect(result.size).toBe(3);
    expect(result.winner).toBe('X');
    expect(result.moves).toHaveLength(3);
    expect(result.isSinglePlayer).toBe(false);
    expect(typeof result.createdAt).toBe('string'); // ISO 8601
  });

  it('persists the replay in the repository', async () => {
    const result = await useCase.execute(validDTO);
    const found = await repo.findById(result.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(result.id);
  });

  it('returns createdAt as a valid ISO string', async () => {
    const result = await useCase.execute(validDTO);
    expect(() => new Date(result.createdAt)).not.toThrow();
    expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
  });

  it('saves multiple replays and assigns unique ids', async () => {
    const r1 = await useCase.execute(validDTO);
    const r2 = await useCase.execute({ ...validDTO, winner: null });

    expect(r1.id).not.toBe(r2.id);
  });

  it('throws DomainError for invalid size', async () => {
    await expect(useCase.execute({ ...validDTO, size: 2 })).rejects.toThrow(DomainError);
  });

  it('throws DomainError for empty moves', async () => {
    await expect(useCase.execute({ ...validDTO, moves: [] })).rejects.toThrow(DomainError);
  });

  it('throws DomainError when a move is out of bounds', async () => {
    const badMoves = [{ row: 5, col: 0, player: 'X' as const }];
    await expect(useCase.execute({ ...validDTO, moves: badMoves })).rejects.toThrow(DomainError);
  });
});
