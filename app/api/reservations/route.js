import { NextResponse } from 'next/server';
import { handle, HttpError, readJson } from '@/lib/owner/api';
import { createReservation, markReservationPaid } from '@/lib/owner/services';
import { clientKey, rateLimit } from '@/lib/security/rateLimit';

/**
 * Public. Creates a PENDING booking from the booking form. The room is held for 20 minutes while the guest pays.
 * The server recalculates the price itself; any total sent by the browser is ignored.
 *
 * Payment gateway: not connected yet. When it is, return { paymentUrl } here and call markReservationPaid(id, { authority, refId })
 * from the gateway's callback route after the payment is verified.
 *
 * For testing the whole flow (booking -> owner notification) without a gateway: put PAYMENT_FAKE=1 in .env.local.
 * It only works outside production (NODE_ENV !== 'production'), so it can never mark real bookings as paid.
 */
export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  if (!rateLimit(`book:${clientKey(request)}`, { limit: 15, windowMs: 60 * 60 * 1000 })) throw new HttpError(429, 'too_many');
  const body = await readJson(request);
  if (body.termsAccepted !== true) throw new HttpError(400, 'terms');

  const created = await createReservation(body, { source: 'online' });
  const fake = process.env.PAYMENT_FAKE === '1' && process.env.NODE_ENV !== 'production';
  if (fake) {
    const paid = await markReservationPaid(created.id, { method: 'online', authority: 'FAKE', refId: 'FAKE' });
    return NextResponse.json({ ok: true, code: paid.code, paid: true, paymentUrl: null }, { status: 201 });
  }
  return NextResponse.json({ ok: true, code: created.code, paid: false, paymentUrl: null }, { status: 201 });
});
