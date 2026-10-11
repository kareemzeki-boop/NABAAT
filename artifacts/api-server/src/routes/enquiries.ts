import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  topic: z.enum(["Plant or flower", "Care question", "Gift idea", "Something else"]),
  sample: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  // Hidden honeypot field. Real visitors leave it empty; bot submissions are quietly discarded.
  website: z.string().max(200).optional().default(""),
});

const router: IRouter = Router();

router.post("/enquiries", async (req, res, next) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Please check your name, email, enquiry topic and message.",
      fields: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const submission = parsed.data;
  if (submission.website) {
    // Do not disclose the honeypot to automated senders; do not store spam.
    res.status(201).json({ status: "received" });
    return;
  }

  try {
    const [record] = await db
      .insert(enquiriesTable)
      .values({
        id: randomUUID(),
        name: submission.name,
        email: submission.email.toLowerCase(),
        topic: submission.topic,
        sampleSlug: submission.sample || null,
        message: submission.message,
      })
      .returning({ id: enquiriesTable.id, createdAt: enquiriesTable.createdAt });

    res.status(201).json({ status: "received", id: record.id, createdAt: record.createdAt });
  } catch (error) {
    next(error);
  }
});

export default router;
