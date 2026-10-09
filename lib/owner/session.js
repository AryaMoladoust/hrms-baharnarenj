import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE = 'bn-owner';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // a week

function secret() {
  const value = process.env.OWNER_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === 'production') throw new Error('OWNER_SESSION_SECRET (at least 32 characters) is not set');
  return 'dev-only-secret-do-not-use-in-production!!'; // local development only
}

const sign = (body) => crypto.createHmac('sha256', secret()).update(body).digest('base64url');

// The session is a signed (HMAC) token, not a database row: { u: username, sv: sessionVersion, exp: epoch seconds }.
export function createToken({ username, sessionVersion }, nowMs = Date.now()) {
  const body = Buffer.from(JSON.stringify({ u: username, sv: sessionVersion, exp: Math.floor(nowMs / 1000) + MAX_AGE_SECONDS })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token, nowMs = Date.now()) {
  if (!token || typeof token !== 'string') return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > nowMs / 1000 ? payload : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(owner) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken({ username: owner.username, sessionVersion: owner.sessionVersion }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}

// For owner pages (server components): send visitors without a session to the login page.
export async function requireOwner() {
  const session = await getSession();
  if (!session) redirect('/owner/login');
  return session;
}
