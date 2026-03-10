import main_logger from '@the-civia-project/logger';
import { drizzle } from 'drizzle-orm/libsql';
import type { Logger } from 'drizzle-orm/logger';

const logger = main_logger().child({ ctx: 'DB' });

class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    logger.trace({ query, params }, 'Executing query');
  }
}

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
  },
  logger: new DrizzleLogger(),
});

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type TransactionOrDatabase = typeof db | Transaction;

export const transaction = db.transaction.bind(db);
