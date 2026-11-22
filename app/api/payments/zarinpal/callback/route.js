import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { markReservationPaid } from '@/lib/owner/services';
import { verifyZarinpalPayment } from '@/lib/payment/zarinpal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resultUrl(request, params) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const url = new URL('/booking/done', base);
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  return NextResponse.redirect(url, 303);
}

export async function GET(request) {
  const query = new URL(request.url).searchParams;
  const authority = query.get('Authority') || '';
  const status = query.get('Status') || '';
  if (!authority || authority.length > 64) return resultUrl(request, { payment: 'failed' });

  try {
    const reservation = await repo.findReservationByPaymentAuthority(authority);
    if (!reservation) return resultUrl(request, { payment: 'failed' });
    if (reservation.status === 'paid') return resultUrl(request, { code: reservation.code, payment: 'success' });
    if (reservation.status !== 'pending') return resultUrl(request, { code: reservation.code, payment: 'failed' });
    if (status.toUpperCase() !== 'OK') return resultUrl(request, { code: reservation.code, pending: '1', payment: 'cancelled' });

    const verification = await verifyZarinpalPayment({ authority, amountToman: reservation.pricing?.total });
    if (!verification.success || !verification.refId) {
      console.error('ZarinPal verification failed', { reservationCode: reservation.code, code: verification.code, message: verification.message });
      return resultUrl(request, { code: reservation.code, pending: '1', payment: 'failed' });
    }

    const paid = await markReservationPaid(reservation.id, {
      method: 'online', authority, refId: verification.refId,
    });
    return resultUrl(request, { code: paid.code, payment: 'success' });
  } catch (error) {
    console.error('ZarinPal callback error:', error?.message || error);
    return resultUrl(request, { payment: 'error' });
  }
}
