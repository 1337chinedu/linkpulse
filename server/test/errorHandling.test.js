import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import * as Sentry from "@sentry/node";

test("an unexpected error results in a clean 500 JSON response, not a crash", async () => {
  const app = express();
  app.get("/boom", () => {
    throw new Error("deliberate test error");
  });

  // Same chain as src/app.js: Sentry reports it, then our handler responds.
  Sentry.setupExpressErrorHandler(app);
  app.use((err, req, res, next) => {
    res.status(500).json({ error: "Internal server error" });
  });

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const res = await fetch(`${baseUrl}/boom`);
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.error, "Internal server error");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
