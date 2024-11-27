import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blockTags } from "./schema/block";
import { follows } from "./schema/follow";
import { tags } from "./schema/tag";
import { roles, users } from "./schema/user";

const pool = new Pool({ max: 5, connectionString: process.env.DATABASE_URL });
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
