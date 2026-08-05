import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./lib/logger.js";
import linksRouter from "./routes/links.js";
import redirectRouter from "./routes/redirect.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api", linksRouter);
app.use("/", redirectRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;