import { query } from "./db.js";
import { generateShortCode } from "./shortCode.js";

function toRecord(row) {
  return {
    code: row.code,
    url: row.url,
    userId: row.user_id,
    clicks: row.clicks,
    createdAt: row.created_at.toISOString(),
    lastClickedAt: row.last_clicked_at
      ? row.last_clicked_at.toISOString()
      : undefined,
  };
}

export async function createLink(url, userId, { code, length } = {}) {
  if (code) {
    try {
      const { rows } = await query(
        `INSERT INTO links (code, url, user_id)
         VALUES ($1, $2, $3)
         RETURNING code, url, user_id, clicks, created_at, last_clicked_at`,
        [code, url, userId],
      );
      return toRecord(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        throw Object.assign(new Error("Code already in use"), {
          code: "CODE_TAKEN",
        });
      }
      throw err;
    }
  }

  for (;;) {
    const candidate = generateShortCode(length);
    const { rows } = await query(
      `INSERT INTO links (code, url, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING
       RETURNING code, url, user_id, clicks, created_at, last_clicked_at`,
      [candidate, url, userId],
    );
    if (rows.length > 0) {
      return toRecord(rows[0]);
    }
  }
}

// Unscoped by design: redirects must resolve regardless of who owns the link.
export async function getLink(code) {
  const { rows } = await query(
    `SELECT code, url, user_id, clicks, created_at, last_clicked_at
     FROM links
     WHERE code = $1`,
    [code],
  );
  return rows[0] ? toRecord(rows[0]) : undefined;
}

export async function getLinkForUser(code, userId) {
  const { rows } = await query(
    `SELECT code, url, user_id, clicks, created_at, last_clicked_at
     FROM links
     WHERE code = $1 AND user_id = $2`,
    [code, userId],
  );
  return rows[0] ? toRecord(rows[0]) : undefined;
}

export async function listLinksForUser(userId) {
  const { rows } = await query(
    `SELECT code, url, user_id, clicks, created_at, last_clicked_at
     FROM links
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toRecord);
}

export async function recordClick(code) {
  const { rows } = await query(
    `UPDATE links
     SET clicks = clicks + 1, last_clicked_at = now()
     WHERE code = $1
     RETURNING code, url, user_id, clicks, created_at, last_clicked_at`,
    [code],
  );
  return rows[0] ? toRecord(rows[0]) : undefined;
}

