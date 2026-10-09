import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, readJson } from '@/lib/owner/api';
import { HOLD_MINUTES } from '@/lib/owner/overlap';
import { normalizeName, ValidationError } from '@/lib/owner/validate';
import { isValidNationalId, normalizeDigits } from '@/lib/booking/validation';
import { clientKey, rateLimit } from '@/lib/security/rateLimit';

// Public "My reservations": the guest types the name and national ID used when booking. Both must match exactly.
// Only the fields the guest needs are returned (no phone number, no notes, nothing about other guests).
export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  if (!rateLimit(`lookup:${clientKey(request)}`, { limit: 20, windowMs: 60 * 60 * 1000 })) throw new HttpError(429, 'too_many');
  const { fullName, nationalId } = await readJson(request);
  const id = normalizeDigits(nationalId || '');
  if (!isValidNationalId(id)) throw new ValidationError({ nationalId: 'errNationalId' });

  const nowMs = Date.now();
  const wanted = normalizeName(fullName);
  const list = (await repo.listReservationsByNationalId(id))
    .filter((r) => normalizeName(r.guest?.fullName) === wanted)
    .filter((r) => r.status !== 'pending' || nowMs - new Date(r.createdAt).getTime() < HOLD_MINUTES * 60000 || r.source === 'manual') // hide abandoned payments
    .map((r) => ({ id: r.id, code: r.code, roomSlug: r.roomSlug, checkIn: r.checkIn, checkOut: r.checkOut, guests: r.guests, status: r.status, total: r.pricing?.total ?? 0 }));
  return NextResponse.json({ reservations: list });
});
