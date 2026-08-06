import { query } from "./db.js";
import { generateApiKey, hashApiKey } from "./auth.js";

function toRecord(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    keyPrefix: row.key_prefix,
    createdAt: row.created_at.toISOString(),
    lastUsedAt: row.last_used_at ? row.last_used_at.toISOString() : undefined,
  };
}

export async function createApiKey(userId, name) {
  const { key, prefix, hash } = generateApiKey();
  const { rows } = await query(
    `INSERT INTO api_keys (user_id, name, key_prefix, key_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, name, key_prefix, created_at, last_used_at`,
    [userId, name, prefix, hash],
  );
  return { ...toRecord(rows[0]), key };
}

export async function listApiKeys(userId) {
  const { rows } = await query(
    `SELECT id, user_id, name, key_prefix, created_at, last_used_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toRecord);
}

export async function revokeApiKey(userId, keyId) {
  const { rowCount } = await query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
    [keyId, userId],
  );
  return rowCount > 0;
}

export async function findUserIdByApiKey(rawKey) {
  const hash = hashApiKey(rawKey);
  const { rows } = await query(
    `UPDATE api_keys SET last_used_at = now()
     WHERE key_hash = $1
     RETURNING user_id`,
    [hash],
  );
  return rows[0]?.user_id;
}
