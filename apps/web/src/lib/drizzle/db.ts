import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

config({ path: '.env.local' });

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(client, { schema: { ...schema, ...relations } });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});