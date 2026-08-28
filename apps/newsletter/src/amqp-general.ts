import amqp from '@the-civia-project/amqp';
import { GracefulWorker, mapError } from '@the-civia-project/core';
import {
  getValidatedEmailAddresses,
  getNewsletterById,
  logProcessedNewsletterEmail,
  processNewsletterProgress,
} from '@the-civia-project/db';
import main_logger from '@the-civia-project/logger';
import { renderEmail } from './prepare-emails.ts';

const amqp_logger = main_logger().child({ ctx: 'AMQP_GENERAL' });

const MAX_DATABASE_UPDATE_PREFETCH = 10;

// Publish to queue that will send emails
const queueSendEmail = await amqp.queueSendEmail();

await amqp.consumeProcessNewsletter(
  1,
  async ({ newsletter_id, request_id, skip, take }, { ack, reject }) => {
    amqp_logger.info(
      { newsletter_id, request_id },
      'Started processing newsletter',
    );

    const newsletter_document = await getNewsletterById(newsletter_id);

    if (!newsletter_document) {
      reject();
      return;
    }

    const email_addresses = getValidatedEmailAddresses(skip, take);

    let item: IteratorResult<{ uuid: string; address: string }, null>;
    while ((item = await email_addresses.next())) {
      if (item.value) {
        const { uuid, address } = item.value;

        const insert_uuid = await logProcessedNewsletterEmail(
          newsletter_document.uuid,
          address,
          request_id,
        );

        const email = renderEmail(newsletter_document.body, uuid);

        const result = queueSendEmail({
          request_id,
          newsletter_id,
          to: address,
          subject: newsletter_document.subject,
          body: email.html,
          text: email.text,
        });

        if (!result.success) {
          amqp_logger.error(result.error, 'Failed to queue the email');
        }
      } else if (item.done) {
        break;
      }
    }

    ack();
  },
);

//
// Process newsletter progress
//
await amqp.consumeDatabaseUpdate(
  MAX_DATABASE_UPDATE_PREFETCH,
  ({ newsletter_id, count }, { ack, reject }) =>
    processNewsletterProgress(newsletter_id, count)
      .then((finished) => {
        if (finished) {
          amqp_logger.info({ newsletter_id }, 'Finished sending newsletter');
        }

        ack();
      })
      .catch((e) => {
        const error = mapError(e);
        amqp_logger.error(error, 'Failed to update the database');

        reject();
      }),
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
