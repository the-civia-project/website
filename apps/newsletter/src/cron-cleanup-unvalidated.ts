import { GracefulWorker, mapError } from '@the-civia-project/core';
import { deleteStaleUnvalidatedEmailAddresses } from '@the-civia-project/db';
import main_logger from '@the-civia-project/logger';

const logger = main_logger().child({ ctx: 'CLEANUP_UNVALIDATED' });

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let work: Promise<number> | null = null;

async function cleanupStaleUnvalidatedEmails() {
  try {
    work = deleteStaleUnvalidatedEmailAddresses();

    const deleted = await work;

    logger.info({ deleted }, 'Cleaned up stale unvalidated email addresses');
  } catch (e) {
    const error = mapError(e);
    logger.error(error, 'Failed to clean up stale unvalidated email addresses');
  }
}

await cleanupStaleUnvalidatedEmails();

const interval = setInterval(() => {
  void cleanupStaleUnvalidatedEmails();
}, ONE_DAY_MS);

new GracefulWorker().onGracefulShutdown(async () => {
  logger.info('Worker shutting down gracefully...');

  clearInterval(interval);

  if (work) {
    await work;
  }

  logger.info('Worker gracefully shut down');
});
