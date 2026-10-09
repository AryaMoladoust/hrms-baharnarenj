// Small in-memory limiter for the public endpoints (guest lookup, booking). Best effort only: on serverless every instance has its own memory.
// For real protection put a firewall / rate limit in front of the site (Vercel Firewall) as well.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }, nowMs = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= nowMs) {
    buckets.set(key, { count: 1, reset: nowMs + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip')) || 'unknown';
}
