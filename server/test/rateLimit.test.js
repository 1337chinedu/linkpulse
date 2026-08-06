import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { ipKeyGenerator } from "express-rate-limit";
import { createRateLimiter } from "../src/middleware/rateLimit.js";

async function withTestApp(limiter, run) {
  const app = express();
  app.use((req, res, next) => {
    req.userId = req.headers["x-test-user"];
    next();
  });
  app.get("/ping", limiter, (req, res) => res.status(200).json({ ok: true }));

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("rate limiter returns 429 after the configured max requests", async () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  await withTestApp(limiter, async (baseUrl) => {
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${baseUrl}/ping`);
      assert.equal(res.status, 200);
    }

    const blocked = await fetch(`${baseUrl}/ping`);
    assert.equal(blocked.status, 429);
    const body = await blocked.json();
    assert.match(body.error, /too many requests/i);
  });
});

test("a custom keyGenerator isolates rate limit buckets independently", async () => {
  const limiter = createRateLimiter({
    windowMs: 60_000,
    max: 1,
    keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip),
  });
  await withTestApp(limiter, async (baseUrl) => {
    const userA1 = await fetch(`${baseUrl}/ping`, { headers: { "x-test-user": "a" } });
    assert.equal(userA1.status, 200);

    const userA2 = await fetch(`${baseUrl}/ping`, { headers: { "x-test-user": "a" } });
    assert.equal(userA2.status, 429);

    const userB1 = await fetch(`${baseUrl}/ping`, { headers: { "x-test-user": "b" } });
    assert.equal(userB1.status, 200);
  });
});
