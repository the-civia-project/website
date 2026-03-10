import { eq } from 'drizzle-orm';
import { db, type TransactionOrDatabase } from './drizzle.ts';
import {
  email_addresses,
  newsletter_processed_emails,
  newsletters,
} from './schema.ts';

export type ProcessedNewsletterEmail = {
  email: string;
  request_id: string;
};

export const subscribeEmailAddress = async (
  email: string,
  tx_or_db: TransactionOrDatabase = db,
) => {
  const inserted = await tx_or_db
    .insert(email_addresses)
    .values({ email })
    //
    // SECURITY: INFORMATION DISCLOSURE MITIGATION
    //
    // By using `onConflictDoNothing`,
    // we avoid revealing whether an email address
    // is already subscribed or not
    //
    .onConflictDoNothing()
    .returning({ inserted_uuid: email_addresses.uuid })
    .then((r) => r[0]);

  if (inserted) {
    return inserted;
  }

  const existing = await tx_or_db
    .select({ inserted_uuid: email_addresses.uuid })
    .from(email_addresses)
    .where(eq(email_addresses.email, email))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) {
    throw new Error('Failed to resolve subscriber UUID after insert conflict');
  }

  return existing;
};

export const unSubscribeEmailAddress = async (uuid: string) => {
  return db
    .delete(email_addresses)
    .where(eq(email_addresses.uuid, uuid))
    .returning({
      deleted_uuid: email_addresses.uuid,
      address: email_addresses.email,
    })
    .then((r) => r[0]);
};

export const registerNewsletter = (
  name: string,
  subject: string,
  text: string,
  body: string,
  total: number,
) => {
  return db
    .insert(newsletters)
    .values({
      name,
      subject,
      text,
      body,
      total,
    })
    .onConflictDoNothing()
    .returning({ inserted_uuid: newsletters.uuid })
    .then(async (r) => {
      const inserted = r[0];

      if (inserted) {
        return inserted;
      }

      const existing = await db
        .select({ inserted_uuid: newsletters.uuid })
        .from(newsletters)
        .where(eq(newsletters.name, name))
        .limit(1)
        .then((result) => result[0]);

      if (!existing) {
        throw new Error(
          'Failed to resolve newsletter UUID after insert conflict',
        );
      }

      return existing;
    });
};

export const logProcessedNewsletterEmail = async (
  newsletter_uuid: string,
  email: string,
  request_id: string,
  tx_or_db: TransactionOrDatabase = db,
) => {
  return tx_or_db
    .insert(newsletter_processed_emails)
    .values({
      newsletter_uuid,
      email,
      request_id,
    })
    .onConflictDoNothing()
    .returning({ inserted_uuid: newsletter_processed_emails.uuid });
};
