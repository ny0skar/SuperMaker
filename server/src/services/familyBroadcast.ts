import { Response } from "express";

interface SSEClient {
  res: Response;
  userId: string;
}

/** In-memory store of active SSE connections grouped by familyGroupId */
const clients = new Map<string, SSEClient[]>();

/** Add a client to a family group's SSE channel */
export function addClient(groupId: string, userId: string, res: Response): void {
  if (!clients.has(groupId)) {
    clients.set(groupId, []);
  }
  clients.get(groupId)!.push({ res, userId });

  console.log(
    `[SSE] Client connected: user=${userId} group=${groupId} (${clients.get(groupId)!.length} active)`,
  );
}

/** Remove a client when they disconnect */
export function removeClient(groupId: string, userId: string, res: Response): void {
  const group = clients.get(groupId);
  if (!group) return;

  const filtered = group.filter((c) => c.res !== res);
  if (filtered.length === 0) {
    clients.delete(groupId);
  } else {
    clients.set(groupId, filtered);
  }

  console.log(
    `[SSE] Client disconnected: user=${userId} group=${groupId} (${filtered.length} remaining)`,
  );
}

/** Broadcast an event to all clients in a family group */
export function broadcast(
  groupId: string,
  event: string,
  data: unknown,
  excludeUserId?: string,
): void {
  const group = clients.get(groupId);
  if (!group || group.length === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of group) {
    if (excludeUserId && client.userId === excludeUserId) continue;
    try {
      client.res.write(payload);
    } catch {
      // Client disconnected, will be cleaned up
    }
  }
}

/** Get count of active connections (for health check / debugging) */
export function getStats(): { groups: number; connections: number } {
  let connections = 0;
  for (const group of clients.values()) {
    connections += group.length;
  }
  return { groups: clients.size, connections };
}
