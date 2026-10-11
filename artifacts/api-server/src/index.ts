import { pool } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

async function start() {
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
  await pool.query("CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)");

  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Nabaat API listening");
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
