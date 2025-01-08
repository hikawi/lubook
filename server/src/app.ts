import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { Status } from "./misc/status";
import mainRouter from "./routes/main.route";

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

// Routes
app.use(mainRouter);

// Error handling
app.use(async (err: Error, req: any, res: any, next: any) => {
  res.status(Status.INTERNAL_SERVER_ERROR);
  return res.json({ status: res.statusCode, message: err.message });
});

export default app;
