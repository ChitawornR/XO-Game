import { Replay } from '../../../domain/entities/Replay';
import { ReplayRepository } from '../../../application/ports/ReplayRepository';
import { ReplayModel } from './ReplaySchema';

export class MongoReplayRepository implements ReplayRepository {
  async save(replay: Omit<Replay, 'id'>): Promise<Replay> {
    const doc = await ReplayModel.create(replay);
    return this.toEntity(doc);
  }

  async findAll(): Promise<Replay[]> {
    const docs = await ReplayModel.find().sort({ createdAt: -1 });
    return docs.map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<Replay | null> {
    const doc = await ReplayModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReplayModel.findByIdAndDelete(id);
    return result !== null;
  }

  private toEntity(doc: InstanceType<typeof ReplayModel>): Replay {
    return {
      id: (doc._id as { toString(): string }).toString(),
      size: doc.size,
      winner: doc.winner,
      moves: doc.moves,
      isSinglePlayer: doc.isSinglePlayer,
      isOnline: doc.isOnline ?? false,
      createdAt: doc.createdAt,
      userId: doc.userId,
    };
  }
}
