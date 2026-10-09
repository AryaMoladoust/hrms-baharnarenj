import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, readJson, requireOwnerApi } from '@/lib/owner/api';
import { todayTehran } from '@/lib/owner/dates';
import { isActive } from '@/lib/owner/overlap';
import { createReservation } from '@/lib/owner/services';
import { RESERVATION_STATUSES } from '@/lib/owner/constants';

// ?status=pending|paid|cancelled|blocked  &when=upcoming|past|today  &room=<slug>  &q=<text>
export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const params = new URL(request.url).searchParams;
  const status = RESERVATION_STATUSES.includes(params.get('status')) ? params.get('status') : undefined;
  const q = (params.get('q') || '').slice(0, 60);
  const when = params.get('when');
  const room = params.get('room');
  const nowMs = Date.now();
  const today = todayTehran(new Date(nowMs));

  let list = await repo.listReservations({ status, q, limit: 400 });
  if (room) list = list.filter((r) => r.roomSlug === room);
  if (when === 'upcoming') list = list.filter((r) => r.checkOut >= today).sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));
  if (when === 'past') list = list.filter((r) => r.checkOut < today);
  if (when === 'today') list = list.filter((r) => r.checkIn <= today && today <= r.checkOut);
  return NextResponse.json({ today, reservations: list.map((r) => ({ ...r, active: isActive(r, nowMs) })) });
});

// Manual booking (phone / Instagram / walk-in) or a block. The server prices it exactly like an online booking unless a price is typed in.
export const POST = handle(async (request) => {
  const owner = await requireOwnerApi(request);
  const body = await readJson(request);
  const kind = body.mode === 'block' ? 'block' : 'booking';
  const created = await createReservation(body, {
    source: 'manual', createdBy: owner.username, kind,
    paidNow: kind === 'booking' && Boolean(body.paid), method: body.method, priceOverride: body.price ?? null, note: body.note,
  });
  return NextResponse.json({ ok: true, reservation: created }, { status: 201 });
});
