import { Router } from 'express';
import { ReplayController } from '../controllers/ReplayController';
import { validateBody } from '../middlewares/validateBody';
import { createReplaySchema } from '../validators/replay.schema';
import { authenticate } from '../middlewares/authenticate';

export function buildReplayRouter(controller: ReplayController): Router {
  const router = Router();

  router.post('/', authenticate, validateBody(createReplaySchema), controller.create);
  router.get('/', authenticate, controller.list);
  router.get('/:id', authenticate, controller.getById);
  router.delete('/:id', authenticate, controller.remove);

  return router;
}
