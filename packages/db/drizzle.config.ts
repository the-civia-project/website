import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env', quiet: true });
}

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
  },
});
