import { generateShortCode } from "./shortCode.js";

const links = new Map();

export function createLink(url, { code, length } = {}) {
  let shortCode = code;
  if (shortCode) {
    if (links.has(shortCode)) {
      throw Object.assign(new Error("Code already in use"), {
        code: "CODE_TAKEN",
      });
    }
  } else {
    do {
      shortCode = generateShortCode(length);
    } while (links.has(shortCode));
  }

  const record = {
    code: shortCode,
    url,
    createdAt: new Date().toISOString(),
    clicks: 0,
  };
  links.set(shortCode, record);
  return record;
}

export function getLink(code) {
  return links.get(code);
}

export function recordClick(code) {
  const record = links.get(code);
  if (!record) return undefined;
  record.clicks += 1;
  record.lastClickedAt = new Date().toISOString();
  return record;
}

export function clearLinks() {
  links.clear();
}
