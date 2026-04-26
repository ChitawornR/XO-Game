import { Replay } from '../../domain/entities/Replay';

export interface ReplayRepository {
  save(replay: Omit<Replay, 'id'>): Promise<Replay>;
  findAll(): Promise<Replay[]>;
  findById(id: string): Promise<Replay | null>;
  delete(id: string): Promise<boolean>;
}
