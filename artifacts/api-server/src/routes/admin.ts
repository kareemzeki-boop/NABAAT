import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import express, { Router, type IRouter } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import {
  adminConfigured,
  checkLoginAllowed,
  issueAdminToken,
  passwordMatches,
  recordLoginAttempt,
  requireAdmin,
} from "../lib/adminAuth";
import { defaultSiteContent } from "../lib/siteContent";

const router: IRouter = Router();
const contentKeys = Object.keys(
  defaultSiteContent,
) as (keyof typeof defaultSiteContent)[];
const contentSchema = z
  .object(
    Object.fromEntries(
      contentKeys.map((key) => [key, z.string().trim().max(5000)]),
    ) as Record<(typeof contentKeys)[number], z.ZodString>,
  )
  .extend({
    email: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "Enter a valid email address.",
      ),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(
        /^[+0-9().\-\s]*$/,
        "Use a phone number with digits and standard punctuation.",
      ),
    instagram: z
      .string()
      .trim()
      .max(500)
      .refine(isSafeHttpsUrl, "Use a secure https:// link."),
    tiktok: z
      .string()
      .trim()
      .max(500)
      .refine(isSafeHttpsUrl, "Use a secure https:// link."),
  })
  .strict();

function isSafeHttpsUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
const productSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(2).max(120),
    latin: z.string().trim().max(160),
    description: z.string().trim().min(5).max(500),
    categories: z.array(z.string().trim().min(1).max(60)).max(20),
    image: z
      .string()
      .trim()
      .min(1)
      .max(2048)
      .refine(
        (value) => value.startsWith("/") || isSafeHttpsUrl(value),
        "Use a site path or secure https:// image URL.",
      ),
    alt: z.string().trim().min(3).max(240),
    light: z.enum([
      "Bright indirect",
      "Bright light",
      "Low to medium",
      "Direct sun",
    ]),
    watering: z.string().trim().min(5).max(500),
    setting: z.enum(["Indoor", "Outdoor"]),
    maintenance: z.enum(["Easy", "Moderate"]),
    goal: z.enum(["Greenery", "Flowers", "Fruit tree", "Gift"]),
    size: z.array(z.string().trim().min(1).max(40)).max(12),
    warning: z.string().trim().max(500),
    care: z.string().trim().min(5).max(500),
    published: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(10000).default(100),
  })
  .strict();
const statuses = [
  "new",
  "in_progress",
  "waiting",
  "resolved",
  "archived",
] as const;
const enquiryUpdateSchema = z
  .object({
    status: z.enum(statuses).optional(),
    adminNote: z.string().trim().max(4000).optional(),
    followUpAt: z.string().datetime().nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
const uploadsDirectory =
  process.env.UPLOAD_DIR ??
  (process.env.NODE_ENV === "production"
    ? "/data/uploads"
    : path.resolve("tmp/uploads"));
const publicApiOrigin = (
  process.env.PUBLIC_API_ORIGIN ??
  "https://workspaceapi-server-production-5d30.up.railway.app"
).replace(/\/+$/, "");

router.post("/admin/login", (req, res) => {
  if (!adminConfigured()) {
    res.status(503).json({
      error:
        "Admin access is not configured. Set a 16+ character ADMIN_PASSWORD secret in Railway.",
    });
    return;
  }
  const ip = req.ip || "unknown";
  if (!checkLoginAllowed(ip)) {
    res.status(429).json({
      error: "Too many sign-in attempts. Please wait 15 minutes and try again.",
    });
    return;
  }
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  const ok = passwordMatches(password);
  recordLoginAttempt(ip, ok);
  if (!ok) {
    res.status(401).json({ error: "That password wasn’t recognized." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json({ token: issueAdminToken(), expiresIn: 43200 });
});

router.get("/admin/session", requireAdmin, (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ authenticated: true });
});

router.get("/admin/products", requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query<{
      data: object;
      is_published: boolean;
      sort_order: number;
    }>(
      "SELECT data, is_published, sort_order FROM products ORDER BY sort_order, slug",
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({
      products: rows.map(({ data, is_published, sort_order }) => ({
        ...data,
        published: is_published,
        sortOrder: sort_order,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", requireAdmin, async (req, res, next) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Check the product details.",
      fields: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const product = parsed.data;
  try {
    const result = await pool.query(
      "INSERT INTO products (slug, data, is_published, sort_order) VALUES ($1, $2::jsonb, $3, $4) ON CONFLICT (slug) DO NOTHING RETURNING slug",
      [
        product.slug,
        JSON.stringify(product),
        product.published,
        product.sortOrder,
      ],
    );
    if (result.rowCount === 0) {
      res.status(409).json({
        error: "A product already uses that web address. Choose another slug.",
      });
      return;
    }
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/products/:slug", requireAdmin, async (req, res, next) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Check the product details.",
      fields: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const product = parsed.data;
  try {
    const result = await pool.query(
      "UPDATE products SET slug = $2, data = $3::jsonb, is_published = $4, sort_order = $5, updated_at = now() WHERE slug = $1 RETURNING slug",
      [
        req.params.slug,
        product.slug,
        JSON.stringify(product),
        product.published,
        product.sortOrder,
      ],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: "That product no longer exists." });
      return;
    }
    res.json({ product });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        error: "A product already uses that web address. Choose another slug.",
      });
      return;
    }
    next(error);
  }
});

router.get("/admin/content", requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query<{ key: string; value: string }>(
      "SELECT content_key AS key, value FROM site_content",
    );
    const content: Record<string, string> = { ...defaultSiteContent };
    for (const row of rows) content[row.key] = row.value;
    res.setHeader("Cache-Control", "no-store");
    res.json({ content });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/content", requireAdmin, async (req, res, next) => {
  const parsed = contentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Check the website content fields.",
      fields: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const [key, value] of Object.entries(parsed.data)) {
      await client.query(
        "INSERT INTO site_content (content_key, value) VALUES ($1, $2) ON CONFLICT (content_key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()",
        [key, value],
      );
    }
    await client.query("COMMIT");
    res.json({ content: parsed.data });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
});

router.get("/admin/enquiries", requireAdmin, async (req, res, next) => {
  const query =
    typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  const status =
    typeof req.query.status === "string" &&
    statuses.includes(req.query.status as (typeof statuses)[number])
      ? req.query.status
      : "";
  const requestedLimit = Number(req.query.limit ?? 50);
  const limit = Number.isInteger(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 50))
    : 50;
  const requestedOffset = Number(req.query.offset ?? 0);
  const offset = Number.isInteger(requestedOffset)
    ? Math.max(0, Math.min(requestedOffset, 1_000_000))
    : 0;
  const searchPattern = query ? `%${query.replace(/[\\%_]/g, "\\$&")}%` : "";
  try {
    const [pageResult, countResult, newResult, allResult] = await Promise.all([
      pool.query(
        `SELECT id, name, email, topic, sample_slug AS "sampleSlug", message, status,
              admin_note AS "adminNote", follow_up_at AS "followUpAt", created_at AS "createdAt"
         FROM enquiries
        WHERE ($1 = '' OR status = $1)
          AND ($2 = '' OR name ILIKE $2 OR email ILIKE $2 OR topic ILIKE $2 OR message ILIKE $2)
        ORDER BY CASE WHEN status = 'new' THEN 0 ELSE 1 END, created_at DESC
        LIMIT $3 OFFSET $4`,
        [status, searchPattern, limit, offset],
      ),
      pool.query<{ total: number }>(
        `SELECT count(*)::int AS total FROM enquiries
          WHERE ($1 = '' OR status = $1)
            AND ($2 = '' OR name ILIKE $2 OR email ILIKE $2 OR topic ILIKE $2 OR message ILIKE $2)`,
        [status, searchPattern],
      ),
      pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM enquiries WHERE status = 'new'",
      ),
      pool.query<{ count: number }>(
        "SELECT count(*)::int AS count FROM enquiries",
      ),
    ]);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      enquiries: pageResult.rows,
      total: countResult.rows[0]?.total ?? 0,
      newCount: newResult.rows[0]?.count ?? 0,
      allCount: allResult.rows[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/enquiries/:id", requireAdmin, async (req, res, next) => {
  const parsed = enquiryUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Check the follow-up details.",
      fields: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const update = parsed.data;
  try {
    const { rows } = await pool.query(
      `UPDATE enquiries SET
         status = COALESCE($2, status),
         admin_note = COALESCE($3, admin_note),
         follow_up_at = CASE WHEN $4 THEN $5::timestamptz ELSE follow_up_at END,
         updated_at = now()
       WHERE id = $1
       RETURNING id, status, admin_note AS \"adminNote\", follow_up_at AS \"followUpAt\"`,
      [
        req.params.id,
        update.status ?? null,
        update.adminNote ?? null,
        update.followUpAt !== undefined,
        update.followUpAt ?? null,
      ],
    );
    if (!rows.length) {
      res.status(404).json({ error: "That enquiry no longer exists." });
      return;
    }
    res.json({ enquiry: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/admin/uploads",
  requireAdmin,
  (req, res, next) => {
    const contentType = (req.header("content-type") ?? "")
      .split(";")[0]
      .toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      res.status(415).json({ error: "Upload a JPEG, PNG, or WebP image." });
      return;
    }
    express.raw({ type: "image/*", limit: "8mb" })(req, res, next);
  },
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: "Choose a non-empty image file." });
        return;
      }
      const contentType = (req.header("content-type") ?? "")
        .split(";")[0]
        .toLowerCase();
      const signatures: Record<string, (body: Buffer) => boolean> = {
        "image/jpeg": (body) =>
          body.length >= 3 &&
          body[0] === 0xff &&
          body[1] === 0xd8 &&
          body[2] === 0xff,
        "image/png": (body) =>
          body.length >= 8 &&
          body
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
        "image/webp": (body) =>
          body.length >= 12 &&
          body.toString("ascii", 0, 4) === "RIFF" &&
          body.toString("ascii", 8, 12) === "WEBP",
      };
      if (!signatures[contentType]?.(req.body)) {
        res.status(400).json({
          error: "The file contents do not match a supported image format.",
        });
        return;
      }
      await mkdir(uploadsDirectory, { recursive: true });
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const filename = `${randomUUID()}.${extensions[contentType]}`;
      await writeFile(path.join(uploadsDirectory, filename), req.body, {
        flag: "wx",
        mode: 0o644,
      });
      res.status(201).json({ url: `${publicApiOrigin}/media/${filename}` });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
