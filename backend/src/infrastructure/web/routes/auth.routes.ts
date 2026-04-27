import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middlewares/validateBody';
import { registerSchema, loginSchema } from '../validators/auth.schema';

export function buildAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post('/register', validateBody(registerSchema), controller.handleRegister);
  router.post('/login', validateBody(loginSchema), controller.handleLogin);
  return router;
}
