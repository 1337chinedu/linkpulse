import { query } from "./db.js";
import { generateShortCode } from "./shortCode.js";
import {
  getCachedLink,
  setCachedLink,
  invalidateCachedLink,
  incrementCachedClicks,
  getCachedClicks,
  clearCachedClicks,
} from "./cache.js";

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
      const record = toRecord(rows[0]);
      await invalidateCachedLink(code);
      await clearCachedClicks(code);
      return record;
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
      const record = toRecord(rows[0]);
      await invalidateCachedLink(candidate);
      await clearCachedClicks(candidate);
      return record;
    }
  }
}

// Unscoped by design: redirects must resolve regardless of who owns the link.
export async function getLink(code) {
  // Try cache first (fast path for hot links)
  const cached = await getCachedLink(code);
  if (cached) return cached;

  // Cache miss: query database
  const { rows } = await query(
    `SELECT code, url, user_id, clicks, created_at, last_clicked_at
     FROM links
     WHERE code = $1`,
    [code],
  );
  if (rows.length === 0) return undefined;

  const record = toRecord(rows[0]);
  // Cache for future requests
  await setCachedLink(code, record);
  return record;
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
  // Increment in cache for speed (fire-and-forget)
  await incrementCachedClicks(code);

  // Still update DB for persistence, but async in background
  // (don't await to avoid slowing down the redirect)
  query(
    `UPDATE links
     SET clicks = clicks + 1, last_clicked_at = now()
     WHERE code = $1`,
    [code],
  ).catch((err) => {
    console.error(`Failed to record click for ${code}:`, err);
  });

  // Return the link for the redirect (no need to wait for DB update)
  return undefined;
}

// Sync clicks from Redis back to the database periodically
export async function syncClicksFromCache() {
  // This is called by a background job (see index.js)
  // to ensure clicks are eventually persisted to the database
  if (!process.env.UPSTASH_REDIS_REST_URL) return;

  try {
    // Get all keys matching clicks:*
    // Note: Upstash REST API doesn't support KEYS command directly,
    // so we'd need a different approach (like storing link codes in a set).
    // For now, this is a placeholder that the application can call manually
    // or via a periodic job.
  } catch (err) {
    console.error("Error syncing clicks from cache:", err);
  }
}

