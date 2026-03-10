import { Result, mapError } from '@the-civia-project/core';
import mainLogger from '@the-civia-project/logger';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

type QueueItem<T> = {
  /**
   * The value to process
   */
  value: T;
  /**
   * The promise that will resolve when the value has been processed
   */
  promise: PromiseWithResolvers<void>;
};

export class ProcessingRateLimitExceededError<TCause> extends Error {
  public cause: TCause;
  public time_until_reset_ms: number;

  constructor(
    options: ErrorOptions & { cause: TCause; time_until_reset_ms: number },
  ) {
    super('Processing Rate Limited', options);

    this.name = 'ProcessingRateLimitExceededError';
    this.cause = options.cause;
    this.time_until_reset_ms = options.time_until_reset_ms;
  }
}

/**
 * Queues Emails to be sent in Bulk
 */
export class ProcessingQueue<
  TValue,
  TProcessingResult,
  TProcessingError extends Error,
> {
  /**
   * The queue of items to process.
   *
   * Needs to be emptied after processing has finished
   */
  #queue: QueueItem<TValue>[] = [];

  /**
   * An incremental id to identify each processing batch in the logs
   */
  #queue_id = 0;

  /**
   * A logger instance with the queueId already set, so all logs from this class will have the queueId in their context
   */
  #logger = mainLogger().child({
    queue_id: this.#queue_id,
  });

  /**
   * When we are processing, we no longer accept anything added to the queue.
   *
   * This blocks pushing to the #queue until all work has been done
   */
  #processing: Promise<void> | null = null;

  /** Tracks when the first item was added to the queue  */
  #queue_start_time: Date | null = null;

  /**
   * Tracks when the queue should be processed
   * ```ts
   * this.#queue_start_processing_timer + this.maxQueueingTimeSeconds
   * ```
   */
  #queue_start_processing_timer: NodeJS.Timeout | null = null;

  constructor(
    /**
     * The maximum number of items in the queue before we start processing it
     */
    private readonly max_queue_size: number,
    /**
     * The maximum allowed time for the queue to fill once items are added to it
     */
    private readonly max_queue_time_s: number,
    /**
     *
     */
    private readonly processor: (
      values: TValue[],
      queueId: number,
    ) => Promise<Result<TProcessingResult, TProcessingError>>,
  ) {
    this.#logger.trace(
      {
        max_queue_size,
        max_queue_time_s,
      },
      'Initialized ProcessingQueue',
    );
  }

  /**
   * Adds the `email` to the queue. Waits for ongoing processing to finish first.
   *
   * @param value
   * @returns that will resolve / reject when the email has been processed
   */
  async enqueue(value: TValue) {
    this.#logger.trace('Enqueuing item to processing queue');

    const promise = Promise.withResolvers<void>();

    if (this.#processing) {
      this.#logger.trace(
        'Already processing queue, waiting for current processing to finish before adding new items',
      );

      await this.#processing;
    }

    this.#queue.push({ value, promise });
    this.#logger.trace(
      { new_queue_length: this.#queue.length },
      'Item enqueued',
    );

    // If the queue was not started, start it now
    if (!this.#queue_start_time) {
      this.#logger.trace('First item added to queue, starting queue timer');
      this.#queue_start_time = new Date();

      this.#queue_start_processing_timer = setTimeout(() => {
        this.#logger.trace(
          'Max queueing time reached, processing queue immediately as is',
        );

        this.#processing = this.process();
      }, this.max_queue_time_s * 1000);
    }

    if (this.#queue.length >= this.max_queue_size) {
      this.#logger.trace(
        'Max queue size reached, processing queue immediately and stopping timer',
      );

      // If the queue has reached its size
      // - clear the queue start processing timer
      // - start processing it
      clearTimeout(this.#queue_start_processing_timer!);
      this.#queue_start_processing_timer = null;

      this.#processing = this.process();
    }

    return promise.promise;
  }

  private async process() {
    this.#logger.trace('Processing queue started');

    // Reset the queue start time
    this.#queue_start_time = null;

    // get the list of emails only
    const values = this.#queue.map(({ value }) => value);

    this.#logger.trace({ queue_size: values.length }, 'Processing queue items');

    // `finally` always runs, but on rate-limit we intentionally retry the same
    // queued items. In that case, we must not clear the queue in the
    // outer (rate-limited) attempt.
    let should_clear_queue = true;

    try {
      const result = await this.processor(values, this.#queue_id);

      if (result.success) {
        this.#logger.trace('Processing successful');

        this.#queue.forEach(({ promise }) => promise.resolve());
      } else if (result.error instanceof ProcessingRateLimitExceededError) {
        //
        // We have been rate limited
        // We will wait for the window to pass and reprocess the queue
        //
        this.#logger.warn({ error: result.error }, 'Rate limited. Waiting.');

        await this.rateLimit(result.error.time_until_reset_ms);

        this.#logger.warn('Rate limit should be lifted. Trying again.');

        should_clear_queue = false;

        // Restart processing
        this.#processing = this.process();

        // Return because we are restarting the processing
        return;
      } else {
        this.#logger.error(
          { error: result.error },
          'Processing has failed due to errors',
        );

        this.#queue.forEach(({ promise }) => promise.reject(result.error));
      }
    } catch (e) {
      const error = mapError(e);
      this.#logger.fatal(
        error,
        'Something unexpected happened while processing. Rejecting all items in the queue',
      );

      this.#queue.forEach(({ promise }) => promise.reject(error));
    } finally {
      if (should_clear_queue) {
        this.#logger.trace('Processing queue finished');

        this.#queue.length = 0;
        this.#queue_id++;

        this.#logger = this.#logger.child({
          queue_id: this.#queue_id,
        });
      }
    }
  }

  private rateLimit(time_until_reset_ms: number) {
    return setTimeoutPromise(time_until_reset_ms);
  }
}
