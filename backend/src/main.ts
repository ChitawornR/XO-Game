import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './infrastructure/config/env';
import { connectDB } from './infrastructure/db/connect';
import { MongoReplayRepository } from './infrastructure/db/mongo/MongoReplayRepository';
import { MongoUserRepository } from './infrastructure/db/mongo/MongoUserRepository';
import { SaveReplayUseCase } from './application/use-cases/SaveReplayUseCase';
import { ListReplaysUseCase } from './application/use-cases/ListReplaysUseCase';
import { GetReplayByIdUseCase } from './application/use-cases/GetReplayByIdUseCase';
import { DeleteReplayUseCase } from './application/use-cases/DeleteReplayUseCase';
import { RegisterUseCase } from './application/use-cases/RegisterUseCase';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import { ReplayController } from './infrastructure/web/controllers/ReplayController';
import { AuthController } from './infrastructure/web/controllers/AuthController';
import { buildReplayRouter } from './infrastructure/web/routes/replay.routes';
import { buildAuthRouter } from './infrastructure/web/routes/auth.routes';
import { errorHandler } from './infrastructure/web/middlewares/errorHandler';
import { apiRateLimiter } from './infrastructure/web/middlewares/rateLimit';
import { registerSocketHandlers } from './infrastructure/socket/socketHandler';

// --- Dependency wiring ---
const replayRepo = new MongoReplayRepository();
const userRepo = new MongoUserRepository();

const saveReplay = new SaveReplayUseCase(replayRepo);
const listReplays = new ListReplaysUseCase(replayRepo);
const getReplayById = new GetReplayByIdUseCase(replayRepo);
const deleteReplay = new DeleteReplayUseCase(replayRepo);
const register = new RegisterUseCase(userRepo);
const login = new LoginUseCase(userRepo);

const replayController = new ReplayController(saveReplay, listReplays, getReplayById, deleteReplay);
const authController = new AuthController(register, login);

// --- Express app ---
const app = express();
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: env.CORS_ORIGINS, methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json());
app.use(apiRateLimiter);

app.use('/auth', buildAuthRouter(authController));
app.use('/replay', buildReplayRouter(replayController));
app.use(errorHandler);

registerSocketHandlers(io);

// --- Bootstrap ---
connectDB()
  .then(() => {
    httpServer.listen(env.PORT, () =>
      console.log(`Server running on PORT ${env.PORT}`)
    );
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
