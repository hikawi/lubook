import { Client } from "pg";
import { pool } from "../db";

/**
 * Drops all tables in the database.
 */
export async function resetDatabase() {
  const conn = await pool.connect();
  await conn.query(`truncate table "user" cascade`);
  conn.release();
}

async function runDefaultConnection(fn: (client: Client) => Promise<void>) {
  const conn = new Client({ connectionString: process.env.DATABASE_URL });
  await conn.connect();
  await fn(conn);
  await conn.end();
}
