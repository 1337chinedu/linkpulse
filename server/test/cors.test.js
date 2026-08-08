import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setupTestServer } from "../scripts/testServer.js";

const ctx = setupTestServer({ before, after, beforeEach });

test("an allowed origin gets a matching Access-Control-Allow-Origin header", async () => {
  const res = await fetch(`${ctx.baseUrl}/health`, {
    headers: { origin: "http://localhost:5173" },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
});

test("a disallowed origin is rejected", async () => {
  const res = await fetch(`${ctx.baseUrl}/health`, {
    headers: { origin: "https://evil.example.com" },
  });
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("access-control-allow-origin"), null);
});

test("requests with no Origin header are unaffected by CORS", async () => {
  const res = await fetch(`${ctx.baseUrl}/health`);
  assert.equal(res.status, 200);
});
