import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SESSION_TTL_SECONDS = 12 * 60 * 60;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function configuredPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function sign(payload: string, password: string) {
  return createHmac("sha256", password)
    .update(`nabaat-admin-session-v1:${payload}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = createHmac("sha256", "nabaat-admin-password-check")
    .update(left)
    .digest();
  const b = createHmac("sha256", "nabaat-admin-password-check")
    .update(right)
    .digest();
  return timingSafeEqual(a, b);
}

export function adminConfigured() {
  return configuredPassword().length >= 16;
}

export function checkLoginAllowed(ip: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  return attempt.count < 8;
}

export function recordLoginAttempt(ip: string, succeeded: boolean) {
  if (succeeded) {
    loginAttempts.delete(ip);
    return;
  }
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    attempt.count += 1;
  }
  if (loginAttempts.size > 10_000) {
    for (const [key, value] of loginAttempts) {
      if (value.resetAt <= now) loginAttempts.delete(key);
    }
  }
}

export function passwordMatches(candidate: string) {
  const password = configuredPassword();
  return adminConfigured() && safeEqual(candidate, password);
}

export function issueAdminToken() {
  const password = configuredPassword();
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(
    `${expires}.${randomBytes(18).toString("base64url")}`,
  ).toString("base64url");
  return `${payload}.${sign(payload, password)}`;
}

export function isValidAdminToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = sign(payload, configuredPassword());
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return false;
  }
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const expires = Number(decoded.slice(0, decoded.indexOf(".")));
    return (
      Number.isSafeInteger(expires) && expires > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_.-]+)$/i.exec(authorization);
  if (!isValidAdminToken(match?.[1])) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  next();
}
