import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { auth } from "./middlewares";
import { accountsRouter } from "./routes/accounts.route";
import { blocksRouter } from "./routes/blocks.route";
import { profilesRouter } from "./routes/profiles.route";
import verificationsRouter from "./routes/verifications.route";

// The server-side entrypoint.
const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: "Origin,X-Requested-By,Content-Type,Accepts",
  }),
);

app.options("*", cors());
app.use("/", accountsRouter);
app.use("/profile", profilesRouter);
app.use("/block", blocksRouter);
app.use("/auth", auth);
app.use("/verify", verificationsRouter);

// Error handling
app.use((err: Error, req: any, res: any, next: any) => {
  return res.json({ status: res.statusCode, message: err.message });
});

// Start listening. If it's on VPS prod, it should run on HTTPS.
// Otherwise, just whip up a server for testing.
app.listen(3000, () => {
  console.log("API Server started on port 3000");
});

export default app;
