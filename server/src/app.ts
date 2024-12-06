import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import http from "http";
import https from "https";
import { auth } from "./middlewares";
import { accountsRouter } from "./routes/accounts.route";
import { blocksRouter } from "./routes/blocks.route";
import { profilesRouter } from "./routes/profiles.route";

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

// Error handling
app.use((err: Error, req: any, res: any, next: any) => {
  return res.json({ status: res.statusCode, message: err.message });
});

// Start listening. If it's on VPS prod, it should run on HTTPS.
// Otherwise, just whip up a server for testing.
if (process.env.MODE == "prod") {
  const options = {
    key: readFileSync(process.env.SSL_KEY || ""),
    cert: readFileSync(process.env.SSL_CERT || ""),
  };

  // Server for listening.
  https.createServer(options, app).listen(443, () => {
    console.log("Server started with HTTPS port 443.");
  });

  // Server to redirect back to https.
  http
    .createServer(async (req, res) => {
      res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
      res.end();
    })
    .listen(80, () => {
      console.log("Redirecting server started with HTTP port 80.");
    });
} else {
  app.listen(process.env.PORT || 8080, () => {
    console.log("Dev server started on HTTP port 8080.");
  });
}

export default app;
