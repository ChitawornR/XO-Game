import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  MONGO_URI: z.string().url('MONGO_URI must be a valid URL'),
  PORT: z.coerce.number().int().positive().default(8081),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((val) => val.split(',').map((s) => s.trim())),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
