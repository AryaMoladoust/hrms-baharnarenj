import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, readJson } from '@/lib/owner/api';
import { markReservationPaid, cancelReservation } from '@/lib/owner/services';
import { verifyZarinpalPayment } from '@/lib/payment/zarinpal';
import { clientKey, rateLimit } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = handle(async (request) => {
  if (!rateLimit(`pending-cancel:${clientKey(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 })) {
    throw new HttpError(429, 'too_many');
  }

  const body = await readJson(request);
  const code = String(body.code || '').trim();
  const authority = String(body.authority || '').trim();

  if (!code || code.length > 32 || !authority || authority.length > 64) {
    throw new HttpError(400, 'invalid_request');
  }

  const reservation = await repo.findReservationByPaymentAuthority(authority);
  if (
    !reservation ||
    reservation.code !== code ||
    reservation.kind !== 'booking' ||
    reservation.source !== 'online'
  ) {
    throw new HttpError(404, 'not_found');
  }

  if (reservation.status === 'paid') {
    return NextResponse.json({ ok: true, status: 'paid', code: reservation.code });
  }
  if (reservation.status === 'cancelled') {
    return NextResponse.json({ ok: true, status: 'cancelled', code: reservation.code });
  }
  if (reservation.status !== 'pending') throw new HttpError(409, 'not_pending');

  // A browser request is never enough to release a room: ask ZarinPal first.
  const verification = await verifyZarinpalPayment({
    authority,
    amountToman: reservation.pricing?.total,
  });

  if (verification.success && verification.refId) {
    try {
      const paid = await markReservationPaid(reservation.id, {
        method: 'online',
        authority,
        refId: verification.refId,
      });
      return NextResponse.json({ ok: true, status: 'paid', code: paid.code });
    } catch (error) {
      const latest = await repo.getReservation(reservation.id);
      if (latest?.status === 'paid') {
        return NextResponse.json({ ok: true, status: 'paid', code: latest.code });
      }
      throw error;
    }
  }

  if (verification.code === -51) {
    try {
      const cancelled = await cancelReservation(reservation.id, {
        percent: 0,
        by: 'guest',
        reason: 'لغو رزرو توسط کاربر پس از بازگشت از درگاه پرداخت',
      });
      return NextResponse.json({ ok: true, status: 'cancelled', code: cancelled.code });
    } catch (error) {
      const latest = await repo.getReservation(reservation.id);
      if (latest?.status === 'paid') {
        return NextResponse.json({ ok: true, status: 'paid', code: latest.code });
      }
      if (latest?.status === 'cancelled') {
        return NextResponse.json({ ok: true, status: 'cancelled', code: latest.code });
      }
      throw error;
    }
  }

  // Unknown/network/provider responses fail closed: keep the reservation pending.
  // The provider's code is logged and returned so we can see what ZarinPal answers for an unpaid session.
  console.warn(`[payment] Pending cancel not confirmed for ${reservation.code}: ZarinPal verify code ${verification.code}`);
  return NextResponse.json(
    { ok: false, status: 'pending', error: 'payment_unconfirmed', providerCode: Number.isFinite(verification.code) ? verification.code : null },
    { status: 409 },
  );
});
