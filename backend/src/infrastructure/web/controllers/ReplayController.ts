import { Request, Response, NextFunction } from 'express';
import { SaveReplayUseCase } from '../../../application/use-cases/SaveReplayUseCase';
import { ListReplaysUseCase } from '../../../application/use-cases/ListReplaysUseCase';
import { GetReplayByIdUseCase } from '../../../application/use-cases/GetReplayByIdUseCase';
import { DeleteReplayUseCase } from '../../../application/use-cases/DeleteReplayUseCase';
import { CreateReplayInput } from '../validators/replay.schema';

export class ReplayController {
  constructor(
    private readonly saveReplay: SaveReplayUseCase,
    private readonly listReplays: ListReplaysUseCase,
    private readonly getReplayById: GetReplayByIdUseCase,
    private readonly deleteReplay: DeleteReplayUseCase
  ) {}

  create = async (
    req: Request<object, object, CreateReplayInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.saveReplay.execute({
        ...req.body,
        userId: req.user?.sub,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.sub;
      const all = await this.listReplays.execute();
      // Each user only sees their own replays
      const result = userId ? all.filter((r) => r.userId === userId) : [];
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.getReplayById.execute(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const replay = await this.getReplayById.execute(req.params.id);
      if (replay.userId && replay.userId !== req.user?.sub) {
        res.status(403).json({ error: 'You do not own this replay.' });
        return;
      }
      await this.deleteReplay.execute(req.params.id);
      res.json({ ok: true, deletedId: req.params.id });
    } catch (err) {
      next(err);
    }
  };
}
