import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { defaultSiteContent } from "../lib/siteContent";

const router: IRouter = Router();

router.get("/catalog", async (_req, res, next) => {
  try {
    const { rows } = await pool.query<{ data: unknown }>(
      "SELECT data FROM products WHERE is_published = true ORDER BY sort_order, slug",
    );
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    res.json({ products: rows.map((row) => row.data) });
  } catch (error) {
    next(error);
  }
});

router.get("/content", async (_req, res, next) => {
  try {
    const { rows } = await pool.query<{ key: string; value: string }>(
      "SELECT content_key AS key, value FROM site_content",
    );
    const content: Record<string, string> = { ...defaultSiteContent };
    for (const row of rows) content[row.key] = row.value;
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    res.json({ content });
  } catch (error) {
    next(error);
  }
});

export default router;
