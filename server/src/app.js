import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./lib/logger.js";
import authRouter from "./routes/auth.js";
import apiKeysRouter from "./routes/apiKeys.js";
import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";

const app = express();

// Render/Fly.io sit one reverse-proxy hop in front of the app; without this,
// IP-based rate limiting would see the proxy's IP for every request.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(pinoHttp({ logger }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api/keys", apiKeysRouter);
app.use("/api", linksRouter);
app.use("/", redirectRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  // Client errors raised by trusted middleware (e.g. express.json() body
  // size/parse limits) carry their own 4xx status — pass it through instead
  // of masking it as a 500.
  const status = err.status ?? err.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ error: err.message || "Bad request" });
  }

  req.log?.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;