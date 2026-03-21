import { migrate } from 'drizzle-orm/libsql/migrator';
import { client, db } from './index';

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');
  await client.close();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
