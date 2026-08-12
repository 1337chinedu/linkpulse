import "dotenv/config";
import app from "./app.js";
import logger from "./lib/logger.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`LinkPulse API listening on port ${PORT}`);
});

// Graceful shutdown: drain in-flight requests before exiting
const SHUTDOWN_TIMEOUT = 30000; // 30 seconds max
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    logger.info("Server closed, all in-flight requests have drained");
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error("Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
}

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions (log and exit)
process.on("uncaughtException", (err) => {
  logger.error(err, "Uncaught exception, exiting");
  process.exit(1);
});

// Handle unhandled rejections (log and exit)
process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Unhandled rejection, exiting");
  process.exit(1);
});