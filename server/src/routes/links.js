import { Router } from "express";
import { createLink, getLinkForUser, listLinksForUser } from "../lib/linkStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function buildShortUrl(req, code) {
  return `${req.protocol}://${req.get("host")}/${code}`;
}

function toPublicLink(req, record) {
  return {
    code: record.code,
    url: record.url,
    shortUrl: buildShortUrl(req, record.code),
    createdAt: record.createdAt,
    clicks: record.clicks,
    lastClickedAt: record.lastClickedAt,
  };
}

const router = Router();

router.use(authenticate);

router.post(
  "/links",
  asyncHandler(async (req, res) => {
    const { url, code } = req.body ?? {};

    if (typeof url !== "string" || !isValidUrl(url)) {
      return res
        .status(400)
        .json({ error: "url must be a valid http(s) URL" });
    }

    if (code !== undefined && !CODE_PATTERN.test(code)) {
      return res.status(400).json({
        error: "code must be 3-32 characters of letters, numbers, _ or -",
      });
    }

    let record;
    try {
      record = await createLink(url, req.userId, { code });
    } catch (err) {
      if (err.code === "CODE_TAKEN") {
        return res.status(409).json({ error: "code already in use" });
      }
      throw err;
    }

    res.status(201).json(toPublicLink(req, record));
  }),
);

router.get(
  "/links",
  asyncHandler(async (req, res) => {
    const records = await listLinksForUser(req.userId);
    res.status(200).json({ links: records.map((record) => toPublicLink(req, record)) });
  }),
);

router.get(
  "/links/:code",
  asyncHandler(async (req, res) => {
    const record = await getLinkForUser(req.params.code, req.userId);
    if (!record) {
      return res.status(404).json({ error: "not found" });
    }

    res.status(200).json(toPublicLink(req, record));
  }),
);

export default router;
