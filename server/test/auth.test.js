import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { setupTestServer } from "../scripts/testServer.js";
import { registerUser, uniqueEmail, authHeaders } from "../scripts/testHelpers.js";

const ctx = setupTestServer({ before, after, beforeEach });

test("POST /api/auth/register rejects an invalid email", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", password: "password123" }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/auth/register rejects a short password", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: uniqueEmail(), password: "short" }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/auth/register creates a user and returns a token", async () => {
  const { res, user } = await registerUser(ctx.baseUrl);
  assert.equal(res.status, 201);
  assert.ok(user.id);
  assert.equal(typeof user.email, "string");
  assert.equal(user.passwordHash, undefined);
});

test("POST /api/auth/register rejects a duplicate email", async () => {
  const email = uniqueEmail();
  await registerUser(ctx.baseUrl, { email });
  const { res } = await registerUser(ctx.baseUrl, { email });
  assert.equal(res.status, 409);
});

test("POST /api/auth/login succeeds with the right password", async () => {
  const { email, password } = await registerUser(ctx.baseUrl);
  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.token);
});

test("POST /api/auth/login rejects the wrong password", async () => {
  const { email } = await registerUser(ctx.baseUrl);
  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-password" }),
  });
  assert.equal(res.status, 401);
});

test("POST /api/auth/login rejects an unknown email", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: uniqueEmail(), password: "password123" }),
  });
  assert.equal(res.status, 401);
});

test("GET /api/auth/me requires a token", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/auth/me`);
  assert.equal(res.status, 401);
});

test("GET /api/auth/me rejects a garbage token", async () => {
  const res = await fetch(`${ctx.baseUrl}/api/auth/me`, {
    headers: authHeaders("garbage"),
  });
  assert.equal(res.status, 401);
});

test("GET /api/auth/me returns the current user for a valid token", async () => {
  const { token, user } = await registerUser(ctx.baseUrl);
  const res = await fetch(`${ctx.baseUrl}/api/auth/me`, {
    headers: authHeaders(token),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.user.id, user.id);
  assert.equal(body.user.email, user.email);
});
