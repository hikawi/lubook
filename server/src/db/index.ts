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
  if (process.env.MODE != "prod") {
    memoryServer = await MongoMemoryServer.create();
    url = memoryServer.getUri();
  }

  const m = await mongoose.connect(url, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  });
  return m.connection;
}

/**
 * Disconnects from MongoDB.
 */
export async function disconnectMongo() {
  await mongoose.disconnect();
  if (process.env.MODE != "prod") await memoryServer?.stop();
}

process.on("SIGTERM", () => {
  disconnectMongo().then(() => process.exit(0));
});
