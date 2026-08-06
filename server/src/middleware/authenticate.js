import { verifyToken } from "../lib/auth.js";
import { findUserIdByApiKey } from "../lib/apiKeysStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "missing or invalid authorization header" });
  }

  if (token.startsWith("lp_")) {
    const userId = await findUserIdByApiKey(token);
    if (!userId) {
      return res.status(401).json({ error: "invalid API key" });
    }
    req.userId = userId;
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
});
