import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { markReservationPaid, cancelReservation } from '@/lib/owner/services';
import { verifyZarinpalPayment } from '@/lib/payment/zarinpal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resultUrl(request, params) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const url = new URL('/booking/done', base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return NextResponse.redirect(url, 303);
}

export async function GET(request) {
  const query = new URL(request.url).searchParams;
  const authority = query.get('Authority') || '';
  const gatewayStatus = query.get('Status') || '';

  if (!authority || authority.length > 64) {
    return resultUrl(request, { payment: 'failed' });
  }

  try {
    const reservation = await repo.findReservationByPaymentAuthority(authority);
    if (!reservation) return resultUrl(request, { payment: 'failed' });

    if (reservation.status === 'paid') {
      return resultUrl(request, { code: reservation.code, payment: 'success' });
    }
    if (reservation.status === 'cancelled') {
      return resultUrl(request, { code: reservation.code, payment: 'cancelled' });
    }
    if (reservation.status !== 'pending') {
      return resultUrl(request, { code: reservation.code, payment: 'failed' });
    }

    // Never trust the browser's Status parameter by itself. Verify with ZarinPal
    // even when the gateway returns a non-OK status, because the payment may have completed.
    let verification;
    try {
      verification = await verifyZarinpalPayment({
        authority,
        amountToman: reservation.pricing?.total,
      });
    } catch (error) {
      console.error('[payment:callback] ZarinPal verification request failed:', error?.message || error);
      return resultUrl(request, {
        code: reservation.code,
        pending: '1',
        payment: 'failed',
      });
    }

    if (verification.success && verification.refId) {
      try {
        const paid = await markReservationPaid(reservation.id, {
          method: 'online',
          authority,
          refId: verification.refId,
        });
        return resultUrl(request, { code: paid.code, payment: 'success' });
      } catch (error) {
        const latest = await repo.getReservation(reservation.id);
        if (latest?.status === 'paid') {
          return resultUrl(request, { code: latest.code, payment: 'success' });
        }
        console.error('[payment:callback] Could not mark verified payment as paid:', error?.message || error);
        return resultUrl(request, { code: reservation.code, pending: '1', payment: 'error' });
      }
    }

    // -51 is ZarinPal's explicit response that the transaction was not paid.
    // Any other response is uncertain and must keep the room hold intact.
    if (verification.code === -51) {
      try {
        const cancelled = await cancelReservation(reservation.id, {
          percent: 0,
          by: 'guest',
          reason: gatewayStatus.toUpperCase() === 'OK'
            ? 'پرداخت در زرین‌پال تأیید نشد'
            : 'پرداخت توسط کاربر در درگاه لغو شد',
        });
        return resultUrl(request, { code: cancelled.code, payment: 'cancelled' });
      } catch (error) {
        const latest = await repo.getReservation(reservation.id);
        if (latest?.status === 'paid') {
          return resultUrl(request, { code: latest.code, payment: 'success' });
        }
        if (latest?.status === 'cancelled') {
          return resultUrl(request, { code: latest.code, payment: 'cancelled' });
        }
        console.error('[payment:callback] Could not cancel unpaid reservation:', error?.message || error);
        return resultUrl(request, { code: reservation.code, pending: '1', payment: 'error' });
      }
    }

    console.error('[payment:callback] Payment remains unconfirmed:', {
      reservationCode: reservation.code,
      gatewayStatus,
      verificationCode: verification.code,
      message: verification.message,
    });
    return resultUrl(request, {
      code: reservation.code,
      pending: '1',
      payment: 'failed',
    });
  } catch (error) {
    console.error('[payment:callback] Unexpected callback error:', error?.message || error);
    return resultUrl(request, { payment: 'error' });
  }
}
