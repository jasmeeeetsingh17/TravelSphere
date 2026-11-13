/**
 * Tiny in-memory rate limit for public forms (booking, newsletter).
 * Good enough for one server; it resets when the server restarts.
 */
const hits = new Map<string, number[]>();

/** Returns true when this key made more than `max` requests in the last `windowMs`. */
export function tooMany(key: string, max = 5, windowMs = 10 * 60_000) {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // keep memory bounded
    return recent.length > max;
}

export const clientKey = (request: Request) =>
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
