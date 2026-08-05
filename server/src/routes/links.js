import { Router } from "express";
import { createLink, getLink } from "../lib/linkStore.js";

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

const router = Router();

router.post("/links", (req, res) => {
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
    record = createLink(url, { code });
  } catch (err) {
    if (err.code === "CODE_TAKEN") {
      return res.status(409).json({ error: "code already in use" });
    }
    throw err;
  }

  res.status(201).json({
    code: record.code,
    url: record.url,
    shortUrl: buildShortUrl(req, record.code),
    createdAt: record.createdAt,
  });
});

router.get("/links/:code", (req, res) => {
  const record = getLink(req.params.code);
  if (!record) {
    return res.status(404).json({ error: "not found" });
  }

  res.status(200).json({
    code: record.code,
    url: record.url,
    shortUrl: buildShortUrl(req, record.code),
    createdAt: record.createdAt,
    clicks: record.clicks,
    lastClickedAt: record.lastClickedAt,
  });
});

export default router;
