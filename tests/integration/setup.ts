/**
 * Shared setup for integration tests.
 *
 * These tests require a running PostgreSQL with seeded data.
 * Set DATABASE_URL before running, e.g.:
 *   DATABASE_URL=postgresql://postgres:password@localhost:5433/postgres npx vitest run tests/integration
 */
import { beforeAll, afterAll } from 'vitest'
import pool from '@/lib/db'

beforeAll(async () => {
  // Verify DB connection works
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
  } finally {
    client.release()
  }

  // Check required tables exist
  const { rows } = await pool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename IN ('document', 'document_page', 'token_count')
     ORDER BY tablename`
  )
  const tables = rows.map(r => r.tablename)
  if (!tables.includes('document') || !tables.includes('document_page') || !tables.includes('token_count')) {
    throw new Error(
      `Missing required tables. Found: [${tables.join(', ')}]. ` +
      'Run `npm run seed` to initialise the database.'
    )
  }
})

afterAll(async () => {
  await pool.end()
})
