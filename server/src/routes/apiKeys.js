import { Router } from "express";
import { createApiKey, listApiKeys, revokeApiKey } from "../lib/apiKeysStore.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";

function toPublicKey(record) {
  return {
    id: record.id,
    name: record.name,
    keyPrefix: record.keyPrefix,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
  };
}

const router = Router();

router.use(authenticate);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name is required" });
    }

    const record = await createApiKey(req.userId, name.trim());
    // The raw key is only ever shown once, at creation time.
    res.status(201).json({ ...toPublicKey(record), key: record.key });
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const records = await listApiKeys(req.userId);
    res.status(200).json({ keys: records.map(toPublicKey) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const revoked = await revokeApiKey(req.userId, req.params.id);
    if (!revoked) {
      return res.status(404).json({ error: "not found" });
    }
    res.status(204).end();
  }),
);

export default router;
