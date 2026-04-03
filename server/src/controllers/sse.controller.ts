import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { addClient, removeClient } from "../services/familyBroadcast.js";
import type { ApiResponse } from "@supermaker/shared";

/** SSE endpoint — keeps connection open for real-time family updates */
export async function subscribeToFamily(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (!req.familyGroupId) {
    res.status(403).json({
      success: false,
      error: "You must belong to a family group",
    } satisfies ApiResponse);
    return;
  }

  const groupId = req.familyGroupId;
  const userId = req.userId!;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // Tell nginx not to buffer
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ groupId })}\n\n`);

  // Register client
  addClient(groupId, userId, res);

  // Keep alive every 30 seconds (prevents proxy/firewall timeouts)
  const keepAlive = setInterval(() => {
    try {
      res.write(": keepalive\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 30000);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(keepAlive);
    removeClient(groupId, userId, res);
  });
}
