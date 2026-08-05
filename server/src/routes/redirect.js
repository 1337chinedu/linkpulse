import { Router } from "express";
import { getLink, recordClick } from "../lib/linkStore.js";

const router = Router();

router.get("/:code", (req, res, next) => {
  const record = getLink(req.params.code);
  if (!record) {
    return next();
  }

  recordClick(record.code);
  res.redirect(302, record.url);
});

export default router;
