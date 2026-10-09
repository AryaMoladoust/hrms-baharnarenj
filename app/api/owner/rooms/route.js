import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { addDays } from '@/lib/dates';
import { handle, requireOwnerApi } from '@/lib/owner/api';
import { eachDay, isIsoDate, todayTehran } from '@/lib/owner/dates';
import { buildTimeline, isActive, roomToday } from '@/lib/owner/overlap';
import { rooms } from '@/lib/rooms';

// ?from=YYYY-MM-DD (default today) &days=14 (7 to 45): today's state of every room plus the calendar grid.
export const GET = handle(async (request) => {
  await requireOwnerApi(request);
  const params = new URL(request.url).searchParams;
  const nowMs = Date.now();
  const today = todayTehran(new Date(nowMs));
  const from = isIsoDate(params.get('from')) ? params.get('from') : today;
  const days = Math.min(45, Math.max(7, Number(params.get('days')) || 14));
  const to = addDays(from, days);

  const start = from < today ? from : today;
  const end = to > addDays(today, 31) ? to : addDays(today, 31);
  const reservations = (await repo.listReservations({ from: start, to: end, limit: 500 })).filter((r) => isActive(r, nowMs));

  const slugs = rooms.map((r) => r.slug);
  const dayList = eachDay(from, addDays(from, days - 1));
  const brief = (r) => (r ? { id: r.id, code: r.code, kind: r.kind, status: r.status, guestName: r.guest?.fullName || '', checkIn: r.checkIn, checkOut: r.checkOut, guests: r.guests, note: r.note || '' } : null);
  return NextResponse.json({
    today, from, days: dayList,
    timeline: buildTimeline(slugs, reservations, dayList, nowMs),
    rooms: slugs.map((slug) => {
      const s = roomToday(slug, reservations, today, nowMs);
      return { slug, state: s.state, current: brief(s.current), next: brief(s.next), arriving: Boolean(s.arriving), departing: Boolean(s.departing) };
    }),
  });
});
