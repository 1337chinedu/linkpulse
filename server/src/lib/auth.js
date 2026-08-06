import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;
const JWT_EXPIRES_IN = "7d";
const API_KEY_PREFIX = "lp";

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const key = Buffer.from(keyHex, "hex");
  const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return key.length === derivedKey.length && timingSafeEqual(key, derivedKey);
}

export function signToken(payload) {
  return jwt.sign(payload, requireJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, requireJwtSecret());
}

export function generateApiKey() {
  const secret = randomBytes(24).toString("base64url");
  const key = `${API_KEY_PREFIX}_${secret}`;
  return {
    key,
    prefix: key.slice(0, 10),
    hash: hashApiKey(key),
  };
}

export function hashApiKey(key) {
  return createHash("sha256").update(key).digest("hex");
}

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}
