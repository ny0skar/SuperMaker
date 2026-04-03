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
import familyRoutes from "./routes/family.routes.js";

const app = express();

// Trust reverse proxy (nginx)
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

const allowedOrigins = [
  "https://sm.ozz.com.mx",
  ...(env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://localhost:8081"]
    : []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "100kb" }));

// Rate limiting — general: 100 req/min
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, try again later" },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints — 10 req/min
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many auth attempts, try again later",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);
app.use("/api/auth/logout", authLimiter);

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
app.use("/api/family", familyRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      success: false,
      error:
        env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
  },
);

// Start server
app.listen(env.PORT, () => {
  console.log(`SuperMaker API running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
