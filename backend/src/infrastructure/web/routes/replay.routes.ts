import { Router } from 'express';
import { ReplayController } from '../controllers/ReplayController';
import { validateBody } from '../middlewares/validateBody';
import { createReplaySchema } from '../validators/replay.schema';

export function buildReplayRouter(controller: ReplayController): Router {
  const router = Router();

  router.post('/', validateBody(createReplaySchema), controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.delete('/:id', controller.remove);

  return router;
}
