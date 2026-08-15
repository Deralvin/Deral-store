const { spawnSync } = require('child_process');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER) {
  console.error('Missing database environment variables. Check .env file.');
  process.exit(1);
}

const result = spawnSync('psql', [
  '-h', DB_HOST,
  '-p', String(DB_PORT),
  '-U', DB_USER,
  '-d', DB_NAME,
  '-f', 'migrations/002_create_admin_users_table.sql'
], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PGPASSWORD: DB_PASSWORD || '',
  },
  stdio: 'inherit',
});

if (result.error || result.status !== 0) {
  console.error('Migration failed');
  process.exit(result.status || 1);
}

console.log('Migration completed successfully');
