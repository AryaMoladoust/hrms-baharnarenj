import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError } from '@/lib/owner/api';
import { isIsoDate } from '@/lib/owner/dates';
import { buildRoomInfos } from '@/lib/rooms/info';

// Public. ?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD -> price, add-ons, guest rules and free/booked for every room.
// Prices already include the owner's discount (or increase) percentage.
export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const params = new URL(request.url).searchParams;
  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut <= checkIn) throw new HttpError(400, 'bad_dates');

  const [reservations, settings] = await Promise.all([repo.listReservations({ from: checkIn, to: checkOut }), repo.getSettings()]);
  const rooms = buildRoomInfos({ checkIn, checkOut, discountPercent: settings.discountPercent, reservations });
  return NextResponse.json({ rooms }, { headers: { 'Cache-Control': 'no-store' } });
});
