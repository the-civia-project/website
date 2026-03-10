import { URL } from 'node:url';
import {
  isMainThread,
  parentPort,
  Worker,
  WorkerOptions,
} from 'node:worker_threads';
import * as z from 'zod';

const GracefulShutdownMessage = z.object({
  type: z.literal('shutdown'),
});

const GracefulShutdownCompleteMessage = z.object({
  type: z.literal('shutdown-complete'),
});

export class GracefulWorkerParent extends Worker {
  constructor(filename: string | URL, options?: WorkerOptions) {
    if (!isMainThread) {
      throw new Error(
        'GracefulWorkerParent should only be used in the main thread',
      );
    }

    super(filename, options);
  }

  async gracefulShutdown() {
    return new Promise<void>((resolve, reject) => {
      this.postMessage({ type: 'shutdown' });
      this.once('message', async (message) => {
        const msg = GracefulShutdownCompleteMessage.safeParse(message);

        if (!msg.success) {
          return reject(
            new Error('Invalid shutdown complete message format', {
              cause: message,
            }),
          );
        }

        await this.terminate();
        resolve();
      });
      this.once('error', (err) => {
        reject(err);
      });
    });
  }
}

export class GracefulWorker {
  constructor() {
    if (isMainThread) {
      throw new Error('GracefulWorker should only be used in worker threads');
    }
  }

  async onGracefulShutdown(callback: () => Promise<void>) {
    new Promise<void>((resolve, reject) => {
      parentPort!.on('message', async (message) => {
        const msg = GracefulShutdownMessage.safeParse(message);

        if (!msg.success) {
          return reject(
            new Error('Invalid shutdown message format', { cause: message }),
          );
        }

        try {
          await callback();
          parentPort!.postMessage({ type: 'shutdown-complete' });
          resolve();
        } catch (err) {
          parentPort!.postMessage({ type: 'shutdown-complete' });
          resolve();
        }
      });
    });
  }
}
