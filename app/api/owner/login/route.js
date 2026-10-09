import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, publicOwner, readJson } from '@/lib/owner/api';
import { verifyPassword } from '@/lib/owner/password';
import { ensureSeedOwners } from '@/lib/owner/seed';
import { setSessionCookie } from '@/lib/owner/session';
import { clientKey, rateLimit } from '@/lib/security/rateLimit';

const MAX_FAILED = 5;           // wrong passwords in a row ...
const LOCK_MS = 10 * 60 * 1000; // ... lock that account for 10 minutes
// Checking an unknown username against this takes as long as a real check, so the response time does not reveal which usernames exist.
const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString('base64')}$${Buffer.alloc(64).toString('base64')}`;

export const POST = handle(async (request) => {
  const { username, password } = await readJson(request);
  if (!rateLimit(`login:${clientKey(request)}`, { limit: 30, windowMs: 10 * 60 * 1000 })) throw new HttpError(429, 'too_many');

  await ensureSeedOwners();
  const owner = await repo.findOwnerByUsername(String(username || '').trim());
  const nowMs = Date.now();

  if (!owner) {
    await verifyPassword(String(password || ''), DUMMY_HASH);
    throw new HttpError(401, 'invalid');
  }
  if (owner.lockedUntil > nowMs) throw new HttpError(429, 'locked', { retryAfterSeconds: Math.ceil((owner.lockedUntil - nowMs) / 1000) });

  if (!(await verifyPassword(String(password || ''), owner.passwordHash))) {
    const failed = (owner.failedAttempts || 0) + 1;
    await repo.updateOwner(owner.username, failed >= MAX_FAILED ? { failedAttempts: 0, lockedUntil: nowMs + LOCK_MS } : { failedAttempts: failed });
    throw new HttpError(401, 'invalid');
  }

  const updated = await repo.updateOwner(owner.username, { failedAttempts: 0, lockedUntil: 0, lastLoginAt: new Date(nowMs).toISOString() });
  await setSessionCookie(updated);
  return NextResponse.json({ ok: true, owner: publicOwner(updated) });
});
