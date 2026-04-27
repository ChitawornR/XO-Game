import { describe, it, expect, beforeEach } from 'vitest';
import {
  GetReplayByIdUseCase,
  ReplayNotFoundError,
} from '../GetReplayByIdUseCase';
import { ReplayRepository } from '../../ports/ReplayRepository';
import { Replay } from '../../../domain/entities/Replay';

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
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Replay | null> {
    return this.store.get(id) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

describe('GetReplayByIdUseCase', () => {
  let repo: InMemoryReplayRepository;
  let useCase: GetReplayByIdUseCase;

  beforeEach(() => {
    repo = new InMemoryReplayRepository();
    useCase = new GetReplayByIdUseCase(repo);
  });

  it('returns the DTO for an existing replay', async () => {
    const saved = await repo.save({
      size: 3,
      winner: 'X',
      moves: [{ row: 0, col: 0, player: 'X' }],
      isSinglePlayer: false,
      isOnline: false,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });

    const dto = await useCase.execute(saved.id!);

    expect(dto.id).toBe(saved.id);
    expect(dto.size).toBe(3);
    expect(dto.winner).toBe('X');
    expect(dto.moves).toHaveLength(1);
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('throws ReplayNotFoundError when no replay matches the id', async () => {
    await expect(useCase.execute('does-not-exist')).rejects.toBeInstanceOf(
      ReplayNotFoundError,
    );
  });
});
