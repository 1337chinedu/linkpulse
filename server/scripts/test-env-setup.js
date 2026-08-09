import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as Sentry from "@sentry/node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.test") });

process.env.LOG_LEVEL = "silent";

// app.js calls Sentry.setupExpressErrorHandler(app), which needs an
// initialized SDK even in tests. SENTRY_DSN is unset in .env.test, so this
// is an inert no-op client — nothing is actually sent.
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: "test" });
