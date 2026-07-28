import { asc, count, eq, isNotNull, isNull, ne } from 'drizzle-orm';
import assert from 'node:assert';
import { db } from './drizzle.ts';
import { email_addresses, newsletters } from './schema.ts';

export async function* getValidatedEmailAddresses(skip: number, take: number) {
  assert(skip >= 0, 'skip needs to be greater or equal to 0');
  assert(take > 0, 'take needs to be greater than 0');

  const results = await db
    .select({ uuid: email_addresses.uuid, address: email_addresses.email })
    .from(email_addresses)
    .where(isNotNull(email_addresses.validated_at))
    .orderBy(asc(email_addresses.id))
    .limit(take)
    .offset(skip);

  for (const email of results) {
    yield email;
  }

  skip += take;

  return null;
}

export const isEmailAddressSubscribedById = async (uuid: string) => {
  const result = await db
    .select({ id: email_addresses.uuid })
    .from(email_addresses)
    .where(eq(email_addresses.uuid, uuid))
    .limit(1);

  return result.length > 0;
};

export const getEmailSubscription = async (email: string) => {
  return db
    .select({
      uuid: email_addresses.uuid,
      created_at: email_addresses.created_at,
      validated_at: email_addresses.validated_at,
    })
    .from(email_addresses)
    .where(eq(email_addresses.email, email))
    .limit(1)
    .then((r) => r[0]);
};

export const getNewsletterById = async (uuid: string) =>
  db
    .select()
    .from(newsletters)
    .where(eq(newsletters.uuid, uuid))
    .limit(1)
    .then((res) => (res.length ? res[0] : undefined));

export const getSentNewsletters = async () =>
  await db
    .select({
      name: newsletters.name,
      started_send_at: newsletters.started_send_at,
      finished_send_at: newsletters.finished_send_at,
      finished: newsletters.finished,
      total: newsletters.total,
    })
    .from(newsletters);

export const getUnfinishedNewsletters = async () =>
  await db
    .select()
    .from(newsletters)
    .where(ne(newsletters.total, newsletters.finished));

export const getValidatedSubscriberCount = async () =>
  db
    .select({ count: count() })
    .from(email_addresses)
    .where(isNotNull(email_addresses.validated_at))
    .then((r) => r[0].count);

export const getUnvalidatedSubscriberCount = async () =>
  db
    .select({ count: count() })
    .from(email_addresses)
    .where(isNull(email_addresses.validated_at))
    .then((r) => r[0].count);
