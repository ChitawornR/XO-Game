import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError';
import { ReplayNotFoundError } from '../../../application/use-cases/GetReplayByIdUseCase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ReplayNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof DomainError) {
    res.status(422).json({ error: err.message });
    return;
  }

  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
