import express from 'express';
import cors from 'cors';

import { env } from './infrastructure/config/env';
import { connectDB } from './infrastructure/db/connect';
import { MongoReplayRepository } from './infrastructure/db/mongo/MongoReplayRepository';
import { SaveReplayUseCase } from './application/use-cases/SaveReplayUseCase';
import { ListReplaysUseCase } from './application/use-cases/ListReplaysUseCase';
import { GetReplayByIdUseCase } from './application/use-cases/GetReplayByIdUseCase';
import { DeleteReplayUseCase } from './application/use-cases/DeleteReplayUseCase';
import { ReplayController } from './infrastructure/web/controllers/ReplayController';
import { buildReplayRouter } from './infrastructure/web/routes/replay.routes';
import { errorHandler } from './infrastructure/web/middlewares/errorHandler';
import { apiRateLimiter } from './infrastructure/web/middlewares/rateLimit';

// --- Dependency wiring ---
const replayRepo = new MongoReplayRepository();
const saveReplay = new SaveReplayUseCase(replayRepo);
const listReplays = new ListReplaysUseCase(replayRepo);
const getReplayById = new GetReplayByIdUseCase(replayRepo);
const deleteReplay = new DeleteReplayUseCase(replayRepo);
const replayController = new ReplayController(
  saveReplay,
  listReplays,
  getReplayById,
  deleteReplay,
);

// --- Express app ---
const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(express.json());
app.use(apiRateLimiter);

app.use('/replay', buildReplayRouter(replayController));

// Global error handler must come last
app.use(errorHandler);

// --- Bootstrap ---
connectDB()
  .then(() => {
    app.listen(env.PORT, () =>
      console.log(`Server running on PORT ${env.PORT}`)
    );
  })
  .catch((err: unknown) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
