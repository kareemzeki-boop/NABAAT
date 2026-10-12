import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  slug: varchar("slug", { length: 80 }).primaryKey(),
  data: jsonb("data").notNull(),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteContentTable = pgTable("site_content", {
  key: varchar("content_key", { length: 80 }).primaryKey(),
  value: varchar("value", { length: 5000 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
