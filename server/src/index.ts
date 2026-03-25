import "./utils/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./utils/env.js";
import { prisma } from "./utils/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import storeRoutes from "./routes/store.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, try again later" },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many auth attempts, try again later",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: "Database connection failed",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`SuperMaker API running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
