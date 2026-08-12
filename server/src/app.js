import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import logger from "./lib/logger.js";
import { query } from "./lib/db.js";
import { redis } from "./lib/cache.js";
import authRouter from "./routes/auth.js";
import apiKeysRouter from "./routes/apiKeys.js";
import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";

const app = express();

// Render/Fly.io sit one reverse-proxy hop in front of the app; without this,
// IP-based rate limiting would see the proxy's IP for every request.
app.set("trust proxy", 1);

// GET /:code (the redirect) is a top-level browser navigation, not a fetch/
// XHR, so it's unaffected by CORS regardless of origin — this only gates
// programmatic calls to /api/* from the dashboard's own JS.
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header means a non-browser client (curl, server-to-server,
      // same-origin) — nothing to restrict.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(Object.assign(new Error("Origin not allowed"), { status: 403 }));
    },
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(pinoHttp({ logger }));

// Liveness probe: used by orchestrators to detect if the process is alive
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Readiness probe: checks if the service is ready to serve traffic
app.get("/ready", async (req, res) => {
  const checks = {};

  // Check database connectivity (non-blocking timeout)
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB timeout")), 1000),
    );
    await Promise.race([query("SELECT 1"), timeoutPromise]);
    checks.database = "ok";
  } catch (err) {
    checks.database = "error: " + err.message;
  }

  // Check Redis connectivity (if enabled)
  try {
    if (redis) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 1000),
      );
      await Promise.race([redis.ping(), timeoutPromise]);
      checks.redis = "ok";
    } else {
      checks.redis = "disabled";
    }
  } catch (err) {
    checks.redis = "error: " + err.message;
  }

  const ready =
    checks.database === "ok" && (checks.redis === "ok" || checks.redis === "disabled");
  const statusCode = ready ? 200 : 503;

  res.status(statusCode).json({
    status: ready ? "ready" : "not_ready",
    ...checks,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/keys", apiKeysRouter);
app.use("/api", linksRouter);
app.use("/", redirectRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Reports unhandled errors to Sentry, then forwards to our own handler
// below. Only errors without a status (or status >= 500) get reported —
// expected 4xx client errors are skipped by default.
Sentry.setupExpressErrorHandler(app);

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