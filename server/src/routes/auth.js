import { Router } from "express";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { createUser, findUserByEmail, findUserById } from "../lib/usersStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimit.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

function isValidEmail(value) {
  return (
    typeof value === "string" &&
    value.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(value)
  );
}

function isValidPassword(value) {
  return (
    typeof value === "string" &&
    value.length >= MIN_PASSWORD_LENGTH &&
    value.length <= MAX_PASSWORD_LENGTH
  );
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

const router = Router();

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "a valid email is required" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: `password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
      });
    }

    let user;
    try {
      user = await createUser(email.toLowerCase(), await hashPassword(password));
    } catch (err) {
      if (err.code === "EMAIL_TAKEN") {
        return res.status(409).json({ error: "email already registered" });
      }
      throw err;
    }

    const token = signToken({ sub: user.id });
    res.status(201).json({ token, user: toPublicUser(user) });
  }),
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await findUserByEmail(email.toLowerCase());
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "invalid email or password" });
    }

    const token = signToken({ sub: user.id });
    res.status(200).json({ token, user: toPublicUser(user) });
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(401).json({ error: "user no longer exists" });
    }
    res.status(200).json({ user: toPublicUser(user) });
  }),
);

export default router;
