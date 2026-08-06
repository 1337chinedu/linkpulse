import { query } from "./db.js";

function toRecord(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createUser(email, passwordHash) {
  try {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash, created_at`,
      [email, passwordHash],
    );
    return toRecord(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      throw Object.assign(new Error("Email already registered"), {
        code: "EMAIL_TAKEN",
      });
    }
    throw err;
  }
}

export async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] ? toRecord(rows[0]) : undefined;
}

export async function findUserById(id) {
  const { rows } = await query(
    `SELECT id, email, password_hash, created_at FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] ? toRecord(rows[0]) : undefined;
}

// Cascades to api_keys and links via their foreign keys.
export async function clearUsers() {
  await query("TRUNCATE users CASCADE");
}
