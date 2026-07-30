import {
  validateEnvOrThrow,
  GracefulWorkerParent,
} from '@the-civia-project/core';
import main_logger from '@the-civia-project/logger';
import dotenv from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env', quiet: true });
}

const EnvSchema = z.object({
  API_KEY: z.string().min(1),
  AMQP_URL: z.url(),
  WEBSITE_URL: z.url(),
  // TURSO (used by the db package)
  TURSO_DATABASE_URL: z.url(),
  // Turso Database Auth Token is optional in development, required in production
  TURSO_DATABASE_AUTH_TOKEN: z.string().optional(),
  // Optional override for e2e testing, default handled in `mail.ts`
  BREVO_API_BASE_URL: z.url().optional(),
  BREVO_API_KEY: z.string().min(1),
});

validateEnvOrThrow(EnvSchema);

const logger = main_logger().child({ ctx: 'MAIN' });

const loader = './src/worker-loader.mjs';

const api = new GracefulWorkerParent(loader, {
  workerData: { script_path: './api.ts' },
  env: process.env,
});

const cleanup = new GracefulWorkerParent(loader, {
  workerData: { script_path: './cron-cleanup-unvalidated.ts' },
  env: process.env,
});

const amqp_workers = [
  new GracefulWorkerParent(loader, {
    workerData: { script_path: './amqp-general.ts' },
    env: process.env,
  }),
  new GracefulWorkerParent(loader, {
    workerData: { script_path: './amqp-send-mail.ts' },
    env: process.env,
  }),
  new GracefulWorkerParent(loader, {
    workerData: { script_path: './amqp-send-mail.ts' },
    env: process.env,
  }),
];

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');

  await Promise.all([
    api.gracefulShutdown(),
    cleanup.gracefulShutdown(),
    ...amqp_workers.map((worker) => worker.gracefulShutdown()),
  ]);

  logger.info('Workers gracefully shut down');

  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');

  await Promise.all([
    api.gracefulShutdown(),
    cleanup.gracefulShutdown(),
    ...amqp_workers.map((worker) => worker.gracefulShutdown()),
  ]);

  logger.info('Workers gracefully shut down');

  process.exit(0);
});
