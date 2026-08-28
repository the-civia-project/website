import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { seed } from 'drizzle-seed';
import { email_addresses } from './schema.ts';

dotenv.config({ path: '../../.env', quiet: true });

async function main() {
  const db = drizzle({
    connection: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
    },
  });

  await seed(db, { email_addresses }).refine((f) => ({
    email_addresses: {
      columns: {
        uuid: f.uuid(),
        email: f.email(),
        validation_code_hash: f.string(),
        created_at: f.datetime(),
      },
      count: 5,
    },
  }));
}

main();
