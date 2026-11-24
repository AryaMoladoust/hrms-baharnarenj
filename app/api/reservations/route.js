import { NextResponse } from 'next/server';
import { handle, HttpError, readJson } from '@/lib/owner/api';
import { createReservation, markReservationPaid } from '@/lib/owner/services';
import * as repo from '@/lib/db/repo';
import { clientKey, rateLimit } from '@/lib/security/rateLimit';
import { createZarinpalPayment } from '@/lib/payment/zarinpal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getPublicCallbackOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    throw new Error('NEXT_PUBLIC_SITE_URL is missing. Set it to the public HTTPS site origin.');
  }

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL is not a valid absolute URL.');
  }

  const hostname = url.hostname.toLowerCase();
  const isLocalHost =
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]';

  if (url.protocol !== 'https:' || isLocalHost) {
    throw new Error('ZarinPal requires a publicly reachable HTTPS callback URL. Localhost cannot be used as the callback origin.');
  }

  return url.origin;
}

export const POST = handle(async (request) => {
  if (!rateLimit(`book:${clientKey(request)}`, { limit: 15, windowMs: 60 * 60 * 1000 })) {
    throw new HttpError(429, 'too_many');
  }

  const body = await readJson(request);
  if (body.termsAccepted !== true) throw new HttpError(400, 'terms');

  const created = await createReservation(body, { source: 'online' });
  const fake = process.env.PAYMENT_FAKE === '1' && process.env.NODE_ENV !== 'production';

  if (fake) {
    try {
      const paid = await markReservationPaid(created.id, {
        method: 'online',
        authority: 'FAKE',
        refId: 'FAKE',
      });

      return NextResponse.json({
        ok: true,
        code: paid.code,
        paid: true,
        paymentUrl: null,
        paymentAuthority: null,
      }, { status: 201 });
    } catch (error) {
      await repo.deletePendingReservation(created.id).catch(() => {});
      throw error;
    }
  }

  try {
    const callbackOrigin = getPublicCallbackOrigin();
    const payment = await createZarinpalPayment({
      amountToman: created.pricing.total,
      callbackUrl: `${callbackOrigin}/api/payments/zarinpal/callback`,
      description: `پرداخت رزرو ${created.code} - اقامتگاه بهارنارنج`,
      mobile: created.guest?.mobile,
    });

    // Save the Authority before returning the payment URL to the browser.
    // The conditional update also prevents a late response from reviving a cancelled reservation.
    const saved = await repo.updatePendingReservation(created.id, {
      payment: {
        method: 'online',
        amount: created.pricing.total,
        authority: payment.authority,
        refId: '',
      },
    });

    if (!saved) {
      throw new Error('The reservation was no longer pending when the payment Authority was saved.');
    }

    return NextResponse.json({
      ok: true,
      code: saved.code,
      paid: false,
      paymentUrl: payment.paymentUrl,
      paymentAuthority: payment.authority,
    }, { status: 201 });
  } catch (error) {
    // Do not leave a room held when payment-session creation failed.
    await repo.deletePendingReservation(created.id).catch(() => {});

    const detail = error instanceof Error ? error.message : String(error);
    console.error('[payment:create] Could not create ZarinPal payment:', detail);

    throw new HttpError(
      502,
      'payment_gateway',
      process.env.NODE_ENV !== 'production' ? { detail } : undefined,
    );
  }
});
