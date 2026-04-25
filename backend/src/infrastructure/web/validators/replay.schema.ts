import { z } from 'zod';

const moveSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  player: z.enum(['X', 'O']),
});

export const createReplaySchema = z.object({
  size: z.number().int().min(3).max(10),
  winner: z.enum(['X', 'O']).nullable(),
  moves: z.array(moveSchema).min(1),
  isSinglePlayer: z.boolean(),
});

export type CreateReplayInput = z.infer<typeof createReplaySchema>;
