import BookingDone from '@/components/user/booking/BookingDone';
import * as repo from '@/lib/db/repo';
import { isActive } from '@/lib/owner/overlap';

export const metadata = { title: 'نتیجه پرداخت | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

// The payment gateway sends the guest back to this page after a successful, a cancelled and an unclear payment alike.
// So what the guest sees comes from the reservation itself, never from the address bar: ?payment=success on its own can not show
// "payment successful", and a cancelled or failed payment can never look like a booking.
//   paid        verified payment, booking is final
//   saved       booking held, online payment not connected (guest finishes with support)
//   unconfirmed back from the gateway but the payment is not confirmed yet; the room is held for a short while
//   cancelled   the gateway reported "not paid" and the room was released
//   failed      nothing to confirm (unknown code, hold expired, or the lookup failed)
async function outcomeFor(code, payment, pending) {
  let reservation = null;
  if (code) {
    try {
      reservation = await repo.findReservationByCode(code);
    } catch (error) {
      console.error('[booking:done] Could not look up the reservation:', error?.message || error);
    }
  }
  if (reservation && reservation.kind === 'booking') {
    if (reservation.status === 'paid') return 'paid';
    if (reservation.status === 'cancelled') return 'cancelled';
    if (reservation.status === 'pending') {
      if (!isActive(reservation)) return 'failed'; // the hold ran out without a confirmed payment
      return payment ? 'unconfirmed' : 'saved';
    }
  }
  if (payment === 'cancelled') return 'cancelled';
  if (payment === 'success') return 'unconfirmed'; // the gateway said yes but we cannot check it right now: never claim success
  return 'failed';
}

export default async function BookingDonePage({ searchParams }) {
  const { code = '', payment = '', pending = '' } = await searchParams;
  const safeCode = String(code).slice(0, 30);
  const outcome = await outcomeFor(safeCode, String(payment), Boolean(pending));
  return <BookingDone code={safeCode} outcome={outcome} />;
}
