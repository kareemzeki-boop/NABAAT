import express, { type Express } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "https://kareemzeki-boop.github.io",
];
const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN ?? defaultOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.disable("x-powered-by");
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: false, limit: "128kb" }));
const uploadDirectory =
  process.env.UPLOAD_DIR ??
  (process.env.NODE_ENV === "production"
    ? "/data/uploads"
    : path.resolve("tmp/uploads"));
app.use(
  "/media",
  express.static(uploadDirectory, { dotfiles: "deny", maxAge: "1h" }),
);

app.use("/api", router);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error({ err: error }, "API request failed");
    if (res.headersSent) return;
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : 500;
    if (status === 413) {
      res.status(413).json({
        error: "The upload is too large. Images must be 8 MB or smaller.",
      });
      return;
    }
    if (status === 400) {
      res.status(400).json({
        error: "The request could not be read. Check the submitted data.",
      });
      return;
    }
    res
      .status(500)
      .json({ error: "The request could not be completed. Please try again." });
  },
);

export default app;
