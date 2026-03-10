import { mapError, Result, safeJsonParse } from '@the-civia-project/core';
import main_logger from '@the-civia-project/logger';
import * as amqplib from 'amqplib';
import * as z from 'zod';

const logger = main_logger().child({ ctx: 'AMQP' });

const GenericMessageSchema = z
  .object({
    id: z
      .uuid()
      .default(() => crypto.randomUUID())
      .optional(),
  })
  .strict();

const ProcessNewsletterSchema = GenericMessageSchema.extend({
  request_id: z.uuid(),
  newsletter_id: z.string(),
  skip: z.number().gte(0),
  take: z.number().gt(0),
}).strict();

const SendEmailSchema = GenericMessageSchema.extend({
  request_id: z.uuid(),
  to: z.email(),
  subject: z.string(),
  body: z.string(),
  text: z.string(),
}).strict();

const SendNewsletterSchema = SendEmailSchema.extend({
  newsletter_id: z.string(),
}).strict();

export type ProcessNewsletter = z.infer<typeof ProcessNewsletterSchema>;

export type SendEmail = z.infer<typeof SendEmailSchema>;

export type SendNewsletter = z.infer<typeof SendNewsletterSchema>;

export type Send = SendEmail | SendNewsletter;

const ProcessedNewsletterEmailSchema = GenericMessageSchema.extend({
  email: z.email(),
  request_id: z.uuid(),
}).strict();

export const DBUpdateSchema = GenericMessageSchema.extend({
  newsletter_id: z.string(),
  count: z.number(),
});

export type DBUpdate = z.infer<typeof DBUpdateSchema>;

export const isNewsletterEmail = (email: Send): email is SendNewsletter => {
  return 'newsletter_id' in email;
};

export type GenericConsumerMethods = {
  ack: () => void;
  reject: () => void;
};

/*
  We have 2 main queues:
  - send_email: where we add emails to be sent
  - send_email_db_update: where we add emails that were sent but we failed to update the database for some reason

  Each of these queues has a corresponding dead letter exchange and dead letter queue for later processing.
*/
const PROCESS_NEWSLETTER_QUEUE = 'process_newsletter';
const PROCESS_NEWSLETTER_QUEUE_DL = `${PROCESS_NEWSLETTER_QUEUE}_dl`;
const PROCESS_NEWSLETTER_QUEUE_DLX = `${PROCESS_NEWSLETTER_QUEUE}_dl_exchange`;
const PROCESS_NEWSLETTER_QUEUE_DL_ROUTING_KEY = `${PROCESS_NEWSLETTER_QUEUE}_dl_key`;

const SEND_MAIL_QUEUE = 'send_email';
const SEND_MAIL_QUEUE_DL = `${SEND_MAIL_QUEUE}_dl`;
const SEND_MAIL_QUEUE_DLX = `${SEND_MAIL_QUEUE}_dl_exchange`;
const SEND_MAIL_QUEUE_DL_ROUTING_KEY = `${SEND_MAIL_QUEUE}_dl_key`;

const SEND_MAIL_DB_QUEUE = `${SEND_MAIL_QUEUE}_db_update`;
const SEND_MAIL_DB_UPDATE_QUEUE_DL = `${SEND_MAIL_DB_QUEUE}_dl`;
const SEND_MAIL_DB_UPDATE_QUEUE_DLX = `${SEND_MAIL_DB_QUEUE}_dl_exchange`;
const SEND_MAIL_DB_UPDATE_QUEUE_DL_ROUTING_KEY = `${SEND_MAIL_DB_QUEUE}_dl_key`;

/**
 * Used for gracefully shutting down the consumers, channels and connection
 */
class Working {
  #count = 0;
  #working: Promise<void> | null = null;
  #resolve: (() => void) | null = null;

  work() {
    this.#working = new Promise((resolve) => {
      this.#resolve = resolve;
    });

    this.#count++;
  }

  finish() {
    this.#count--;

    if (this.#count === 0) {
      this.#resolve?.();
    }
  }

  async stop(): Promise<void> {
    if (!this.#working) {
      return Promise.resolve();
    }

    logger.info('Waiting for consumers to finish working');

    return this.#working.then(() => logger.info('Consumers finished working'));
  }
}

async function setupQueue(
  connection: amqplib.ChannelModel,
  queue: string,
  dead_letter_queue: string,
  dead_letter_exchange: string,
  dead_letter_routing_key: string,
) {
  logger.trace(
    {
      queue,
      dead_letter_queue,
      dead_letter_exchange,
      dead_letter_routing_key,
    },
    'Setting up queue',
  );

  const channel = await connection.createChannel();

  // Create Dead Letter Exchange
  await channel.assertExchange(dead_letter_exchange, 'direct', {
    durable: true,
  });

  // Create Dead Letter Queue
  await channel.assertQueue(dead_letter_queue, { durable: true });

  // Bind Dead Letter Queue to Dead Letter Exchange
  await channel.bindQueue(
    dead_letter_queue,
    dead_letter_exchange,
    dead_letter_routing_key,
  );

  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dead_letter_exchange,
      'x-dead-letter-routing-key': dead_letter_routing_key,
    },
  });

  await channel.close();
}

function createConsumer<TDocument extends z.infer<typeof GenericMessageSchema>>(
  channel: amqplib.Channel,
  queue: string,
  dead_letter_exchange: string,
  dead_letter_routing_key: string,
  schemas: z.ZodSchema<TDocument>[],
  working: Working,
) {
  return async function (
    prefetch: number,
    cb: (
      document: TDocument,
      methods: GenericConsumerMethods,
    ) => void | Promise<void>,
  ) {
    logger.trace(
      {
        queue,
        dead_letter_exchange,
        dead_letter_routing_key,
      },
      'Setting up queue consumer',
    );

    await channel.prefetch(prefetch);

    await channel.consume(queue, async (msg) => {
      if (msg === null) {
        logger.fatal('Consumer cancelled by server');

        process.exit(1);
      }

      const content = msg.content.toString();
      const parsed = safeJsonParse(content);

      if (!parsed.success) {
        logger.warn({ content }, 'Failed to JSON parse message content');

        channel.reject(msg, false);

        return;
      }

      const validations = schemas.map((s) => s.safeParse(parsed.value));
      const document = validations.find((result) => result.success)?.data;

      if (!document) {
        logger.warn(
          { content: parsed.value },
          'Message content does not match any schema',
        );

        channel.reject(msg, false);

        return;
      }

      logger.trace(
        { id: document.id },
        'Received message, processing with consumer callback',
      );

      try {
        working.work();
        const result = cb(document, {
          ack: () => {
            logger.trace({ id: document.id }, 'Acknowledged document');

            channel.ack(msg);
          },
          reject: () => {
            logger.trace({ id: document.id }, 'Rejected document');

            channel.reject(msg, false);
          },
        });

        if (result instanceof Promise) {
          await result;
        }
      } catch (e) {
        const error = mapError(e);
        logger.error(error, 'Consumer callback failed, rejecting message');

        channel.reject(msg, false);
      } finally {
        working.finish();
      }
    });
  };
}

function getQueuePublisher<
  TDocument extends z.infer<typeof GenericMessageSchema>,
>(
  connection: amqplib.ChannelModel,
  QUEUE: string,
  schemas: z.ZodSchema<TDocument>[],
) {
  return async () => {
    const send_channel = await connection.createChannel();

    return function queue(
      document: TDocument,
      publish?: amqplib.Options.Publish,
    ): Result<void, Error> {
      // Validate the document against the provided schemas
      const parsed = schemas
        .map((s) => s.safeParse(document))
        .find((r) => r.success);

      if (!parsed) {
        logger.warn(
          'Document does not match any provided schema. Not publishing. Skipping...',
        );

        return {
          success: false,
          error: new Error('Document does not match any provided schema'),
        };
      }

      logger.trace('Queueing document to send');

      send_channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(parsed.data)),
        {
          ...publish,
          persistent: true,
        },
      );

      return {
        success: true,
      };
    };
  };
}

async function main() {
  let connection: amqplib.ChannelModel;
  const working = new Working();

  try {
    connection = await amqplib.connect(process.env.AMQP_URL!);

    logger.info('Connected to AMQP server');
  } catch (e) {
    logger.error(mapError(e), 'Cannot start AMQP connection');

    process.exit(1);
  }

  const process_newsletter_channel = await connection.createChannel();
  const send_mail_channel = await connection.createChannel();
  const db_update_channel = await connection.createChannel();

  /**
   */
  await Promise.all([
    setupQueue(
      connection,
      PROCESS_NEWSLETTER_QUEUE,
      PROCESS_NEWSLETTER_QUEUE_DL,
      PROCESS_NEWSLETTER_QUEUE_DLX,
      PROCESS_NEWSLETTER_QUEUE_DL_ROUTING_KEY,
    ),
    setupQueue(
      connection,
      SEND_MAIL_QUEUE,
      SEND_MAIL_QUEUE_DL,
      SEND_MAIL_QUEUE_DLX,
      SEND_MAIL_QUEUE_DL_ROUTING_KEY,
    ),
    setupQueue(
      connection,
      SEND_MAIL_DB_QUEUE,
      SEND_MAIL_DB_UPDATE_QUEUE_DL,
      SEND_MAIL_DB_UPDATE_QUEUE_DLX,
      SEND_MAIL_DB_UPDATE_QUEUE_DL_ROUTING_KEY,
    ),
  ]);

  return {
    /**
     * Main queue publisher where emails are being send in bulk
     */
    queueProcessNewsletter: getQueuePublisher<ProcessNewsletter>(
      connection,
      PROCESS_NEWSLETTER_QUEUE,
      [ProcessNewsletterSchema],
    ),
    /**
     * Main queue publisher where emails are being send in bulk
     */
    queueSendEmail: getQueuePublisher<Send>(connection, SEND_MAIL_QUEUE, [
      SendEmailSchema,
      SendNewsletterSchema,
    ]),
    /**
     * Gets the queue where emails were sent and we need to update the database for progress tracking
     */
    queueNewsletterDatabaseUpdate: getQueuePublisher<DBUpdate>(
      connection,
      SEND_MAIL_DB_QUEUE,
      [DBUpdateSchema],
    ),
    /**
     * Consumer of the main queue that tries to send the email
     *
     * If there are issues it should either redirect to
     * 1. main dead letter exchange
     * 2. db update dead letter exchange
     */
    consumeProcessNewsletter: createConsumer<ProcessNewsletter>(
      process_newsletter_channel,
      PROCESS_NEWSLETTER_QUEUE,
      PROCESS_NEWSLETTER_QUEUE_DLX,
      PROCESS_NEWSLETTER_QUEUE_DL_ROUTING_KEY,
      [ProcessNewsletterSchema],
      working,
    ),
    /**
     * Consumer of the main queue that tries to send the email
     *
     * If there are issues it should either redirect to
     * 1. main dead letter exchange
     * 2. db update dead letter exchange
     */
    consumeEmail: createConsumer<Send>(
      send_mail_channel,
      SEND_MAIL_QUEUE,
      SEND_MAIL_QUEUE_DLX,
      SEND_MAIL_QUEUE_DL_ROUTING_KEY,
      [SendEmailSchema, SendNewsletterSchema],
      working,
    ),
    /**
     * Consume the db update queue that tries to update the database with the sent email information
     *
     * If there are issues it should redirect to the db update dead letter exchange
     */
    consumeDatabaseUpdate: createConsumer<DBUpdate>(
      db_update_channel,
      SEND_MAIL_DB_QUEUE,
      SEND_MAIL_DB_UPDATE_QUEUE_DLX,
      SEND_MAIL_DB_UPDATE_QUEUE_DL_ROUTING_KEY,
      [DBUpdateSchema],
      working,
    ),
    stop: async () => {
      // Making sure all channels only prefetch 1 document
      await Promise.all([
        process_newsletter_channel.prefetch(1),
        send_mail_channel.prefetch(1),
        db_update_channel.prefetch(1),
      ]);

      await working.stop();

      await Promise.all([
        process_newsletter_channel.close(),
        send_mail_channel.close(),
        db_update_channel.close(),
      ]);

      await connection.close();
    },
  } as const;
}

export default await main();
