/*
The module to connect to the database.
*/

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let memoryServer: MongoMemoryServer | null = null;

/**
 * Attempts to connect mongoDB.
 *
 * @return The connection.
 */
export async function connectMongo() {
  if (mongoose.connection.readyState == 1) return mongoose.connection;

  let url = process.env.MONGO_URL!;
  if (process.env.MODE == "dev" || process.env.MODE == "test") {
    memoryServer = await MongoMemoryServer.create();
    url = memoryServer.getUri();
  }

  return await mongoose
    .connect(url, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    })
    .then((it) => it.connection);
}

/**
 * Disconnects from MongoDB.
 */
export async function disconnectMongo() {
  await mongoose.disconnect();
  if (process.env.MODE == "dev" || process.env.MODE == "test") await memoryServer?.stop();
}

process.on("SIGTERM", async () => {
  await disconnectMongo();
  process.exit(0);
});
