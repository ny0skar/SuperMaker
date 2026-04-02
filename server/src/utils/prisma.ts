import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

export const prisma = new PrismaClient({
  log:
    env.NODE_ENV === "production"
      ? ["warn", "error"]
      : ["query", "info", "warn", "error"],
});
