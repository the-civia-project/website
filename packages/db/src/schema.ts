import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const uuid = (name: string) =>
  text(name, { length: 36 }).$defaultFn(() => crypto.randomUUID());

export const email_addresses = sqliteTable('email_addresses', {
  id: integer('id').primaryKey(),
  uuid: uuid('uuid').unique().notNull(),
  email: text('email').notNull().unique(),
  created_at: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const newsletters = sqliteTable('newsletters', {
  id: integer('id').primaryKey(),
  uuid: uuid('uuid').unique().notNull(),
  name: text('name').notNull().unique(),
  subject: text('subject').notNull().unique(),
  text: text('text').notNull(),
  body: text('body').notNull(),
  started_send_at: text('started_send_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  finished_send_at: text('finished_send_at'),
  finished: integer('finished').default(0),
  total: integer('total').notNull(),
});

export const newsletter_processed_emails = sqliteTable(
  'newsletter_processed_emails',
  {
    id: integer('id').primaryKey(),
    uuid: uuid('uuid').unique().notNull(),
    newsletter_uuid: text('newsletter_uuid').notNull(),
    email: text('email').notNull(),
    request_id: text('request_id').notNull(),
    processed_at: text('processed_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
);
