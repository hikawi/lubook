import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import http from "http";
import https from "https";

// The server-side entrypoint.
const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling
app.use((err: Error, req: any, res: any, next: any) => {
  return res.json({ status: res.statusCode, message: err.message });
});

// Start listening.
if (process.env.MODE != "dev") {
  const options = {
    key: readFileSync(process.env.SSL_KEY!),
    cert: readFileSync(process.env.SSL_CERT!),
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
}

export default app;
