import { Request, Response, NextFunction } from 'express';
import { SaveReplayUseCase } from '../../../application/use-cases/SaveReplayUseCase';
import { ListReplaysUseCase } from '../../../application/use-cases/ListReplaysUseCase';
import { DeleteReplayUseCase } from '../../../application/use-cases/DeleteReplayUseCase';
import { CreateReplayInput } from '../validators/replay.schema';

export class ReplayController {
  constructor(
    private readonly saveReplay: SaveReplayUseCase,
    private readonly listReplays: ListReplaysUseCase,
    private readonly deleteReplay: DeleteReplayUseCase
  ) {}

  create = async (
    req: Request<object, object, CreateReplayInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.saveReplay.execute(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listReplays.execute();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteReplay.execute(req.params.id);
      res.json({ ok: true, deletedId: req.params.id });
    } catch (err) {
      next(err);
    }
  };
}
