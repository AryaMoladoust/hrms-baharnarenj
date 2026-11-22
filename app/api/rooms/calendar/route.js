import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { addDays } from '@/lib/dates';
import { handle, HttpError } from '@/lib/owner/api';
import { isIsoDate } from '@/lib/owner/dates';
import { rooms } from '@/lib/rooms';
import { busyNights } from '@/lib/rooms/nights';

// Public. ?slug=bahar&from=YYYY-MM-DD&days=124 -> the nights of that one room that are taken: { busy: ['2026-10-20', ...] }.
// Only dates, never guest details. Feeds the availability calendar on the room page.
export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const params = new URL(request.url).searchParams;
  const slug = params.get('slug');
  const from = params.get('from');
  if (!rooms.some((room) => room.slug === slug) || !isIsoDate(from)) throw new HttpError(400, 'bad_request');
  const days = Math.min(180, Math.max(7, Number(params.get('days')) || 124));
  const to = addDays(from, days);

  const nowMs = Date.now();
  const reservations = await repo.listReservations({ from, to });
  const busy = [...busyNights(reservations, slug, from, to, nowMs)].sort();
  return NextResponse.json({ slug, from, days, busy }, { headers: { 'Cache-Control': 'no-store' } });
});
