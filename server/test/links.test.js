import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { clearLinks } from "../src/lib/linkStore.js";
import { close as closeDb } from "../src/lib/db.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closeDb();
});

beforeEach(async () => {
  await clearLinks();
});

test("GET /health returns ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("POST /api/links rejects invalid urls", async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "not-a-url" }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/links creates a short link", async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com/some/long/path" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.match(body.code, /^[0-9A-Za-z]{7}$/);
  assert.equal(body.url, "https://example.com/some/long/path");
  assert.equal(body.shortUrl, `${baseUrl}/${body.code}`);
});

test("POST /api/links honors a custom code", async () => {
  const res = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com", code: "my-link" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.code, "my-link");
});

test("POST /api/links rejects a duplicate custom code", async () => {
  await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com", code: "dupe" }),
  });
  const res = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.org", code: "dupe" }),
  });
  assert.equal(res.status, 409);
});

test("GET /:code redirects and GET /api/links/:code tracks the click", async () => {
  const create = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com/redirect-target" }),
  });
  const { code } = await create.json();

  const redirect = await fetch(`${baseUrl}/${code}`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "https://example.com/redirect-target");

  const stats = await fetch(`${baseUrl}/api/links/${code}`);
  const statsBody = await stats.json();
  assert.equal(statsBody.clicks, 1);
});

test("GET /:code for an unknown code falls through to 404", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
});