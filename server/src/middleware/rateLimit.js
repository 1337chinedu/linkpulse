import rateLimit, { ipKeyGenerator } from "express-rate-limit";

function intFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function createRateLimiter({ windowMs, max, keyGenerator }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      res.status(429).json({ error: "too many requests, please try again later" });
    },
  });
}

// IP-based: protects register/login against brute force and credential stuffing.
export const authLimiter = createRateLimiter({
  windowMs: intFromEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  max: intFromEnv("AUTH_RATE_LIMIT_MAX", 50),
});

// Keyed by authenticated identity (not IP) so shared office/NAT IPs and
// multiple API keys per user don't throttle each other unfairly.
export const apiLimiter = createRateLimiter({
  windowMs: intFromEnv("API_RATE_LIMIT_WINDOW_MS", 60 * 1000),
  max: intFromEnv("API_RATE_LIMIT_MAX", 60),
  keyGenerator: (req) => req.userId ?? ipKeyGenerator(req.ip),
});

// IP-based and deliberately generous: redirects are the product's main
// traffic path and must stay usable, this just blunts obvious scraping.
export const redirectLimiter = createRateLimiter({
  windowMs: intFromEnv("REDIRECT_RATE_LIMIT_WINDOW_MS", 60 * 1000),
  max: intFromEnv("REDIRECT_RATE_LIMIT_MAX", 300),
});
