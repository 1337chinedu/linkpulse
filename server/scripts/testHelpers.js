export function uniqueEmail() {
  return `user-${Math.random().toString(36).slice(2)}@example.com`;
}

export async function registerUser(baseUrl, overrides = {}) {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "password123";

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return { email, password, res, token: body.token, user: body.user };
}

export function authHeaders(token) {
  return { authorization: `Bearer ${token}` };
}
