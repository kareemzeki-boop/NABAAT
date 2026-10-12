export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

export function apiUrl(path: string) {
  return `${API_BASE}/api/${path.replace(/^\/+/, "")}`;
}

export function resolveImage(path: string) {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;
  const base = import.meta.env.BASE_URL;
  if (path.startsWith(base)) return path;
  if (path.startsWith("/")) return `${base.replace(/\/$/, "")}${path}`;
  return `${base}${path}`;
}
