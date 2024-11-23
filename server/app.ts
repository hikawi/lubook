import "dotenv/config";
import express from "express";
import { connectMongo } from "./db";

// The server-side entrypoint.
const app = express();

// Start listening.
app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}.`);
  connectMongo().then(() => {
    console.log("Let's go Mongo connected!");
  });
});
