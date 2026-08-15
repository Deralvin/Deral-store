const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'deral-fashion',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || undefined,
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return `${salt}:${derivedKey}`;
}

async function seed() {
  const email = process.env.ADMIN_USERNAME || 'admin@aura-fashion.id';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashed = hashPassword(password);

  await pool.query(`
    INSERT INTO admin_users (email, full_name, password_hash, role, is_active)
    VALUES ($1, $2, $3, $4, TRUE)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  `, [email, 'Admin', hashed, 'super_admin']);

  console.log(`Admin user created/updated: ${email}`);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
