import { drizzle } from "drizzle-orm/node-postgres";
import * as pg from "pg";
import { blockTags, follows, roles, tags, users } from "./schema";

const { Pool } = pg;
const pool = new Pool({
  max: 5,
  host: process.env.POSTGRES_HOST || "localhost",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || "postgres",
  port: Number(process.env.POSTGRES_PORT || 5432),
});

const db = drizzle({
  client: pool,
  schema: { users, roles, follows, tags, blockTags },
});

async function disconnect() {
  try {
    await pool.end();
  } catch (ignored) {}
}

export { db, disconnect, pool };

process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});
