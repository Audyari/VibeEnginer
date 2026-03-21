import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from './index';

async function runMigrate() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');
  await pool.end();
}

runMigrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
