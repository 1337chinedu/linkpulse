import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setupTestServer } from "../scripts/testServer.js";
import { registerUser, authHeaders } from "../scripts/testHelpers.js";

const ctx = setupTestServer({ before, after, beforeEach });

test("POST /api/keys requires authentication", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "test key" }),
  });
  assert.equal(res.status, 401);
});

test("POST /api/keys creates a key and returns the raw secret once", async () => {
  const { token } = await registerUser(ctx.baseUrl);
  const res = await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name: "CI key" }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.match(body.key, /^lp_/);
  assert.equal(body.name, "CI key");
  assert.ok(body.keyPrefix);
});

test("GET /api/keys lists keys without exposing the raw secret", async () => {
  const { token } = await registerUser(ctx.baseUrl);
  await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name: "CI key" }),
  });

  const res = await fetch(`${ctx.baseUrl}/api/keys`, { headers: authHeaders(token) });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.keys.length, 1);
  assert.equal(body.keys[0].name, "CI key");
  assert.equal(body.keys[0].key, undefined);
});

test("a created API key authenticates like a JWT does", async () => {
  const { token } = await registerUser(ctx.baseUrl);
  const create = await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name: "CI key" }),
  });
  const { key } = await create.json();

  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(key) },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  assert.equal(res.status, 201);
});

test("an unknown API key is rejected", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders("lp_not-a-real-key") },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  assert.equal(res.status, 401);
});

test("DELETE /api/keys/:id revokes a key so it can no longer authenticate", async () => {
  const { token } = await registerUser(ctx.baseUrl);
  const create = await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ name: "CI key" }),
  });
  const { id, key } = await create.json();

  const revoke = await fetch(`${ctx.baseUrl}/api/keys/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  assert.equal(revoke.status, 204);

  const res = await fetch(`${ctx.baseUrl}/api/links`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(key) },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  assert.equal(res.status, 401);
});

test("DELETE /api/keys/:id cannot revoke another user's key", async () => {
  const { token: ownerToken } = await registerUser(ctx.baseUrl);
  const { token: strangerToken } = await registerUser(ctx.baseUrl);
  const create = await fetch(`${ctx.baseUrl}/api/keys`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(ownerToken) },
    body: JSON.stringify({ name: "CI key" }),
  });
  const { id } = await create.json();

  const res = await fetch(`${ctx.baseUrl}/api/keys/${id}`, {
    method: "DELETE",
    headers: authHeaders(strangerToken),
  });
  assert.equal(res.status, 404);
});
