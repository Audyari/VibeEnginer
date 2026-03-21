import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../config/env';

export const client = createClient({
  url: env.db.url || 'file:sqlite.db',
});

export const db = drizzle(client);
