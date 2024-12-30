import { S3Client } from "@aws-sdk/client-s3";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blockTags, follows, roles, tags, users } from "./schema";

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

const s3 = new S3Client({
  region: "eu2",
  endpoint: "https://eu2.contabostorage.com",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

async function disconnect() {
  try {
    await pool.end();
  } catch (ignored) {}
}

export { db, disconnect, pool, s3 };

process.on("SIGTERM", async () => {
  await disconnect();
  process.exit(0);
});
