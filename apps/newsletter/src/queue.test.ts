import { describe, expect, it, vi } from 'vitest';
import { ProcessingQueue, ProcessingRateLimitExceededError } from './queue.ts';

// vi.mock() factories are hoisted by Vitest, so any shared mock state
// referenced inside those factories must also be created in a hoisted block.
const { set_timeout_promise_mock } = vi.hoisted(() => ({
  set_timeout_promise_mock: vi.fn(async () => undefined),
}));

// The queue retries after a rate-limit by awaiting node:timers/promises setTimeout.
// Mock it so retry tests are deterministic and instant.
vi.mock('node:timers/promises', () => ({
  setTimeout: set_timeout_promise_mock,
}));

vi.mock('@the-civia-project/logger', () => {
  // Keep a minimal chainable logger surface used by ProcessingQueue.
  const logger = {
    child: vi.fn(() => logger),
    trace: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };

  return {
    default: vi.fn(() => logger),
  };
});

describe('ProcessingQueue', () => {
  it('processes immediately when max queue size is reached', async () => {
    const processor = vi.fn().mockResolvedValue({ success: true });
    const queue = new ProcessingQueue<number, void, Error>(2, 60, processor);

    const first = queue.enqueue(1);
    const second = queue.enqueue(2);

    await Promise.all([first, second]);

    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenCalledWith([1, 2], 0);
  });

  it('processes after max queueing time is reached', async () => {
    vi.useFakeTimers();
    try {
      const processor = vi.fn().mockResolvedValue({ success: true });
      const queue = new ProcessingQueue<number, void, Error>(10, 1, processor);
      const enqueued = queue.enqueue(1);

      await vi.advanceTimersByTimeAsync(1000);
      await enqueued;

      expect(processor).toHaveBeenCalledTimes(1);
      expect(processor).toHaveBeenCalledWith([1], 0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('waits for active processing before accepting new values', async () => {
    const first_batch_done = Promise.withResolvers<void>();
    const second_batch_done = Promise.withResolvers<void>();

    const processor = vi
      .fn()
      .mockImplementationOnce(async () => {
        await first_batch_done.promise;
        return { success: true } as const;
      })
      .mockImplementationOnce(async () => {
        await second_batch_done.promise;
        return { success: true } as const;
      });

    const queue = new ProcessingQueue<number, void, Error>(1, 60, processor);
    const first = queue.enqueue(1);
    const second = queue.enqueue(2);

    expect(processor).toHaveBeenCalledTimes(1);
    expect(processor).toHaveBeenNthCalledWith(1, [1], 0);

    first_batch_done.resolve();
    await first;

    // Let microtasks flush so the second enqueue can continue after processing unlocks.
    await Promise.resolve();

    expect(processor).toHaveBeenCalledTimes(2);
    expect(processor).toHaveBeenNthCalledWith(2, [2], 1);

    second_batch_done.resolve();
    await second;
  });

  it('retries the same queue when rate-limited', async () => {
    const processor = vi
      .fn()
      .mockResolvedValueOnce({
        success: false,
        error: new ProcessingRateLimitExceededError({
          cause: new Error('429'),
          time_until_reset_ms: 500,
        }),
      })
      .mockResolvedValueOnce({ success: true });

    const queue = new ProcessingQueue<number, void, Error>(1, 60, processor);
    queue.enqueue(1);

    // Retry is kicked off from inside process(); wait until the second call is observed.
    await vi.waitFor(() => {
      expect(processor).toHaveBeenCalledTimes(2);
    });

    expect(set_timeout_promise_mock).toHaveBeenCalledWith(500);
    expect(processor).toHaveBeenNthCalledWith(1, [1], 0);
    expect(processor).toHaveBeenNthCalledWith(2, [1], 0);
  });

  it('does not strand multiple queued items on rate-limit retry', async () => {
    const processor = vi
      .fn()
      .mockResolvedValueOnce({
        success: false,
        error: new ProcessingRateLimitExceededError({
          cause: new Error('429'),
          time_until_reset_ms: 500,
        }),
      })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true });

    const queue = new ProcessingQueue<number, void, Error>(1, 1, processor);

    const first = queue.enqueue(1);
    const second = queue.enqueue(2);

    // Retry is kicked off from inside process(); wait until the second call is observed.
    await vi.waitFor(() => {
      expect(processor).toHaveBeenCalledTimes(3);
    });

    expect(processor).toHaveBeenNthCalledWith(1, [1], 0);
    expect(set_timeout_promise_mock).toHaveBeenCalledWith(500);

    expect(processor).toHaveBeenNthCalledWith(2, [1], 0);
    expect(processor).toHaveBeenNthCalledWith(3, [2], 1);

    // If queued promises are stranded by the rate-limit retry path, this would timeout.
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('timeout waiting for queue promises')),
        500,
      ),
    );

    await Promise.race([Promise.all([first, second]), timeout]);
  });

  it('rejects all queued items when processing fails', async () => {
    const processing_error = new Error('processor failed');

    const processor = vi
      .fn()
      .mockResolvedValue({ success: false, error: processing_error });

    const queue = new ProcessingQueue<number, void, Error>(2, 60, processor);

    const results = await Promise.allSettled([
      queue.enqueue(1),
      queue.enqueue(2),
    ]);

    expect(processor).toHaveBeenCalledWith([1, 2], 0);
    expect(results).toEqual([
      { status: 'rejected', reason: processing_error },
      { status: 'rejected', reason: processing_error },
    ]);
  });
});
