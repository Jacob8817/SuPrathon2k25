require('dotenv').config();
const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
 
});

(async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ Connected to the database');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
})();

module.exports = pool;
