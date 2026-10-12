import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pool } from "@workspace/db";
import app from "./app";
import { defaultProducts } from "./lib/catalogDefaults";
import { defaultSiteContent } from "./lib/siteContent";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}
const uploadsDirectory =
  process.env.UPLOAD_DIR ??
  (process.env.NODE_ENV === "production"
    ? "/data/uploads"
    : path.resolve("tmp/uploads"));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id uuid PRIMARY KEY,
      name varchar(120) NOT NULL,
      email varchar(254) NOT NULL,
      topic varchar(40) NOT NULL,
      sample_slug varchar(80),
      message text NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'new',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)",
  );
  await pool.query(`
    ALTER TABLE enquiries
      ADD COLUMN IF NOT EXISTS admin_note text,
      ADD COLUMN IF NOT EXISTS follow_up_at timestamptz,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      slug varchar(80) PRIMARY KEY,
      data jsonb NOT NULL,
      is_published boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 100,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(
    "CREATE INDEX IF NOT EXISTS products_public_order_idx ON products (is_published, sort_order, slug)",
  );
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      content_key varchar(80) PRIMARY KEY,
      value varchar(5000) NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (let i = 0; i < defaultProducts.length; i += 1) {
    const product = defaultProducts[i];
    await pool.query(
      "INSERT INTO products (slug, data, is_published, sort_order) VALUES ($1, $2::jsonb, true, $3) ON CONFLICT (slug) DO NOTHING",
      [product.slug, JSON.stringify(product), (i + 1) * 10],
    );
  }
  for (const [key, value] of Object.entries(defaultSiteContent)) {
    await pool.query(
      "INSERT INTO site_content (content_key, value) VALUES ($1, $2) ON CONFLICT (content_key) DO NOTHING",
      [key, value],
    );
  }
}

async function start() {
  await initializeDatabase();
  await mkdir(uploadsDirectory, { recursive: true });
  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port, uploadsDirectory }, "Nabaat API listening");
  });
  server.on("error", (error) => {
    logger.error({ err: error, port }, "Error listening on port");
    process.exit(1);
  });
}

start().catch((error) => {
  logger.error({ err: error }, "API startup failed");
  process.exit(1);
});
