import { Router } from "express";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { createUser, findUserByEmail, findUserById } from "../lib/usersStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8;
}

function toPublicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: "a valid email is required" });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ error: "password must be at least 8 characters" });
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
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
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
