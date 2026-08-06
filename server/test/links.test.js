import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setupTestServer } from "../scripts/testServer.js";
import { registerUser, authHeaders } from "../scripts/testHelpers.js";

const ctx = setupTestServer({ before, after, beforeEach });

async function createUserAndToken() {
  const { token } = await registerUser(ctx.baseUrl);
  return token;
}

test("GET /health returns ok", async () => {
  const res = await fetch(`${ctx.baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("POST /api/links requires authentication", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  assert.equal(res.status, 401);
});

test("POST /api/links rejects invalid urls", async () => {
  const token = await createUserAndToken();
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ url: "not-a-url" }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/links creates a short link", async () => {
  const token = await createUserAndToken();
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ url: "https://example.com/some/long/path" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.match(body.code, /^[0-9A-Za-z]{7}$/);
  assert.equal(body.url, "https://example.com/some/long/path");
  assert.equal(body.shortUrl, `${ctx.baseUrl}/${body.code}`);
});

test("POST /api/links honors a custom code", async () => {
  const token = await createUserAndToken();
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ url: "https://example.com", code: "my-link" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.code, "my-link");
});

test("POST /api/links rejects a duplicate custom code, even across users", async () => {
  const tokenA = await createUserAndToken();
  const tokenB = await createUserAndToken();

  await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(tokenA) },
    body: JSON.stringify({ url: "https://example.com", code: "dupe" }),
  });
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(tokenB) },
    body: JSON.stringify({ url: "https://example.org", code: "dupe" }),
  });
  assert.equal(res.status, 409);
});

test("GET /:code redirects without authentication and tracks the click", async () => {
  const token = await createUserAndToken();
  const create = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ url: "https://example.com/redirect-target" }),
  });
  const { code } = await create.json();

  const redirect = await fetch(`${ctx.baseUrl}/${code}`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "https://example.com/redirect-target");

  const stats = await fetch(`${ctx.baseUrl}/api/links/${code}`, {
    headers: authHeaders(token),
  });
  const statsBody = await stats.json();
  assert.equal(statsBody.clicks, 1);
});

test("GET /:code for an unknown code falls through to 404", async () => {
  const res = await fetch(`${ctx.baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
});

test("GET /api/links/:code only returns links owned by the caller", async () => {
  const owner = await createUserAndToken();
  const stranger = await createUserAndToken();

  const create = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(owner) },
    body: JSON.stringify({ url: "https://example.com/private" }),
  });
  const { code } = await create.json();

  const asOwner = await fetch(`${ctx.baseUrl}/api/links/${code}`, {
    headers: authHeaders(owner),
  });
  assert.equal(asOwner.status, 200);

  const asStranger = await fetch(`${ctx.baseUrl}/api/links/${code}`, {
    headers: authHeaders(stranger),
  });
  assert.equal(asStranger.status, 404);
});

test("GET /api/links lists only the caller's links", async () => {
  const tokenA = await createUserAndToken();
  const tokenB = await createUserAndToken();

  await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(tokenA) },
    body: JSON.stringify({ url: "https://example.com/a" }),
  });
  await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(tokenB) },
    body: JSON.stringify({ url: "https://example.com/b" }),
  });

  const res = await fetch(`${ctx.baseUrl}/api/links`, { headers: authHeaders(tokenA) });
  const body = await res.json();
  assert.equal(body.links.length, 1);
  assert.equal(body.links[0].url, "https://example.com/a");
});
