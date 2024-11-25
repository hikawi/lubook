/*
The module to connect to the database.
*/

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ max: 5, connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export { db };

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
