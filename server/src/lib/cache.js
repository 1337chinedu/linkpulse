import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const CACHE_TTL = 86400; // 24 hours
const CLICKS_BATCH_INTERVAL = 30000; // sync to DB every 30 seconds in dev, longer in prod

export async function getCachedLink(code) {
  if (!redis) return null;
  try {
    const key = `link:${code}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Cache get error:", err);
    return null;
  }
}

export async function setCachedLink(code, link) {
  if (!redis) return;
  try {
    const key = `link:${code}`;
    await redis.setex(key, CACHE_TTL, JSON.stringify(link));
  } catch (err) {
    console.error("Cache set error:", err);
  }
}

export async function invalidateCachedLink(code) {
  if (!redis) return;
  try {
    const key = `link:${code}`;
    await redis.del(key);
  } catch (err) {
    console.error("Cache invalidate error:", err);
  }
}

export async function incrementCachedClicks(code) {
  if (!redis) return 0;
  try {
    const key = `clicks:${code}`;
    return await redis.incr(key);
  } catch (err) {
    console.error("Click increment error:", err);
    return 0;
  }
}

export async function getCachedClicks(code) {
  if (!redis) return 0;
  try {
    const key = `clicks:${code}`;
    const val = await redis.get(key);
    return val ? parseInt(val, 10) : 0;
  } catch (err) {
    console.error("Cache clicks get error:", err);
    return 0;
  }
}

export async function clearCachedClicks(code) {
  if (!redis) return;
  try {
    const key = `clicks:${code}`;
    await redis.del(key);
  } catch (err) {
    console.error("Cache clicks clear error:", err);
  }
}

export function isRedisEnabled() {
  return redis !== null;
}

export { redis };
