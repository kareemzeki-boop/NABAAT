import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const enquiriesTable = pgTable("enquiries", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  topic: varchar("topic", { length: 40 }).notNull(),
  sampleSlug: varchar("sample_slug", { length: 80 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  adminNote: text("admin_note"),
  followUpAt: timestamp("follow_up_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Enquiry = typeof enquiriesTable.$inferSelect;
export type NewEnquiry = typeof enquiriesTable.$inferInsert;
