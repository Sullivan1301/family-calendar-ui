import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

config({ path: '.env.local' });

const fullSchema = { ...schema, ...relations };

/**
 * Le type doit être inféré depuis le schéma complet : annoter avec
 * `ReturnType<typeof drizzle>` efface les tables et rend `db.query` vide.
 */
type Database = ReturnType<typeof drizzle<typeof fullSchema>>;

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(client, { schema: fullSchema });
  }
  return _db;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
