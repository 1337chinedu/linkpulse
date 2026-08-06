import { Router } from "express";
import { getLink, recordClick } from "../lib/linkStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { redirectLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get(
  "/:code",
  redirectLimiter,
  asyncHandler(async (req, res, next) => {
    const record = await getLink(req.params.code);
    if (!record) {
      return next();
    }

    await recordClick(record.code);
    res.redirect(302, record.url);
  }),
);

export default router;
