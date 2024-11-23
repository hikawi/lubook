import "dotenv/config";
import express from "express";
import { connectMongo } from "./db";
import { accountsRouter } from "./routes/accounts.route";

// The server-side entrypoint.
const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(accountsRouter);

// Error handling
app.use((err: Error, req: any, res: any, next: any) => {
  return res.json({ status: res.statusCode, message: err.message });
});

// Start listening.
if (process.env.MODE != "test") {
  app.listen(process.env.PORT, () => {
    console.log(`Server started on ${process.env.PORT}.`);
    connectMongo();
  });
}

export default app;
