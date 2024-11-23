/*
The module to connect to the database.
*/

import mongoose from "mongoose";

/**
 * Attempts to connect mongoDB.
 *
 * @return The connection.
 */
export async function connectMongo() {
  if (mongoose.connection.readyState == 1) return mongoose.connection;
  return await mongoose
    .connect(process.env.MONGO_URL!, {
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
  console.log("Disconnecting Mongo");
  await mongoose.disconnect();
  console.log("Disconnected from Mongo!");
}

process.on("SIGINT", disconnectMongo);
process.on("SIGTERM", disconnectMongo);
