import amqp, { isNewsletterEmail, Send } from '@the-civia-project/amqp';
import { GracefulWorker, mapError } from '@the-civia-project/core';
import main_logger from '@the-civia-project/logger';
import { AxiosError } from 'axios';
import { RateLimit, sendBulkEmail } from './mail.ts';
import { ProcessingQueue, ProcessingRateLimitExceededError } from './queue.ts';

const amqp_logger = main_logger().child({ ctx: 'AMQP_SEND_MAIL' });

const MAX_MAIL_PREFETCH = 1_000;

// Publish to queue that will update progress in the database
const queueNewsletterDatabaseUpdate =
  await amqp.queueNewsletterDatabaseUpdate();

//
// Process emails
//
// We send a bulk request when
// - We reach a maximum 1_000 emails
// - 2s elapses from the first email in the queue
//
const queue = new ProcessingQueue<
  Send,
  RateLimit,
  Error | ProcessingRateLimitExceededError<AxiosError>
>(
  // max emails to send in bulk
  MAX_MAIL_PREFETCH,
  // max wait time until send queue as is
  2,
  //
  async (emails, queue_id) => {
    amqp_logger.trace(
      { queue_id, count: emails.length },
      'Processing email batch',
    );

    const result = await sendBulkEmail(emails);

    if (result.success) {
      amqp_logger.trace(
        { queue_id, count: emails.length },
        'Successfully sent email batch',
      );

      const sent_newsletters = emails.filter(isNewsletterEmail);

      if (sent_newsletters.length) {
        amqp_logger.trace('Updating newsletter progress');

        const newsletter_groups = sent_newsletters.reduce<
          Record<
            string,
            {
              newsletter_id: string;
              processed_emails: { email: string; request_id: string }[];
            }
          >
        >((acc, email) => {
          const newsletter_id = email.newsletter_id;
          const group = acc[newsletter_id] ?? {
            newsletter_id,
            processed_emails: [],
          };

          group.processed_emails.push({
            email: email.to,
            request_id: email.request_id,
          });

          acc[newsletter_id] = group;
          return acc;
        }, {});

        await Promise.all(
          Object.values(newsletter_groups).map(async (group) => {
            queueNewsletterDatabaseUpdate({
              newsletter_id: group.newsletter_id,
              count: group.processed_emails.length,
            });
          }),
        );
      }
    }

    return result;
  },
);

await amqp.consumeEmail(MAX_MAIL_PREFETCH, (email, { ack, reject }) =>
  queue.enqueue(email).then(ack).catch(reject),
);

//
// Gracefully stop worker
//
new GracefulWorker().onGracefulShutdown(async () => {
  amqp_logger.info('Worker shutting down gracefully...');

  try {
    await amqp.stop();
  } catch (e) {
    const error = mapError(e);
    amqp_logger.error(error, 'Error while shutting down AMQP connection');
  }

  amqp_logger.info('Worker gracefully shut down');
});
