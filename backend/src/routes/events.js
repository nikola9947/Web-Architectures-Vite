import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { addClient } from "../utils/events.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  const removeClient = addClient(req.user.userId, res);

  req.on("close", () => {
    removeClient();
  });
});

export default router;