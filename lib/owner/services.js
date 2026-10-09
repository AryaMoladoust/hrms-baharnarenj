import * as repo from '@/lib/db/repo';
import { HttpError } from '@/lib/owner/api';
import { buildRoomInfos } from '@/lib/rooms/info';
import { getRoomBySlug } from '@/lib/rooms';
import { calculateQuote } from '@/lib/pricing';
import { partsOf } from '@/lib/calendar';
import { formatDay } from '@/lib/dates';
import { conflictsFor } from '@/lib/owner/overlap';
import { daysBetween, todayTehran } from '@/lib/owner/dates';
import { settle } from '@/lib/owner/cancellation';
import { sendPushToOwners } from '@/lib/push';
import { validateGuest, validatePaymentMethod, validateStay, ValidationError } from '@/lib/owner/validate';

const iso = (nowMs) => new Date(nowMs).toISOString();

async function notify(type, reservation, actor) {
  await repo.createNotification({
    type,
    data: {
      reservationId: reservation.id, code: reservation.code, roomSlug: reservation.roomSlug,
      guestName: reservation.guest?.fullName || '', checkIn: reservation.checkIn, checkOut: reservation.checkOut,
      total: reservation.payment?.amount ?? reservation.pricing?.total ?? 0, by: actor || '',
    },
    readBy: actor ? [actor] : [], // the person who did it does not need to be told
  });
  const room = getRoomBySlug(reservation.roomSlug)?.name || reservation.roomSlug;
  const dates = `${formatDay(reservation.checkIn, 'fa')} تا ${formatDay(reservation.checkOut, 'fa')}`;
  const titles = { reservation_paid: 'رزرو جدید پرداخت شد', reservation_manual: 'رزرو دستی ثبت شد', reservation_cancelled: 'رزرو لغو شد' };
  await sendPushToOwners({ title: titles[type], body: `${reservation.guest?.fullName || ''}، اتاق ${room}، ${dates}`, url: '/owner/reservations' }, { excludeUsername: actor });
}

/**
 * Creates an online booking (pending until paid), a manual booking entered by an owner, or a "block" (dates closed for maintenance etc.).
 * The price is ALWAYS computed here on the server from the real price table and the owner's discount; the browser's numbers are ignored.
 */
export async function createReservation(input, { source, createdBy = '', kind = 'booking', paidNow = false, method = 'cash', priceOverride = null, note = '', nowMs = Date.now() }) {
  const today = todayTehran(new Date(nowMs));
  const stay = validateStay(kind === 'block' ? { ...input, guests: 1 } : input, { today, allowPast: source === 'manual' });
  const guest = kind === 'block' ? { fullName: '', mobile: '', nationalId: '' } : validateGuest(input, { strict: source === 'online' });

  const existing = await repo.listReservations({ from: stay.checkIn, to: stay.checkOut });
  if (conflictsFor(existing, stay.slug, stay.checkIn, stay.checkOut, { nowMs }).length) throw new HttpError(409, 'room_booked');

  const settings = await repo.getSettings();
  const nights = daysBetween(stay.checkIn, stay.checkOut);
  let pricing = { lines: [], total: 0, quoteTotal: 0, discountPercent: settings.discountPercent, overridden: false };
  if (kind === 'booking') {
    const info = buildRoomInfos({ checkIn: stay.checkIn, checkOut: stay.checkOut, discountPercent: settings.discountPercent, nowMs }).find((i) => i.slug === stay.slug);
    const quote = calculateQuote({ info, selected: stay.addons, nights, guests: stay.guests });
    let total = quote.total;
    if (priceOverride !== null && priceOverride !== undefined && priceOverride !== '') {
      total = Number(priceOverride);
      if (!Number.isInteger(total) || total < 0 || total > 10_000_000_000) throw new ValidationError({ price: 'errAmount' });
    }
    pricing = { lines: quote.lines, total, quoteTotal: quote.total, discountPercent: settings.discountPercent, overridden: total !== quote.total };
  }

  const code = await repo.nextReservationCode(partsOf(today, 'jalali').y);
  const doc = {
    code, kind, roomSlug: stay.slug, checkIn: stay.checkIn, checkOut: stay.checkOut, nights, guests: stay.guests, addons: stay.addons, guest, pricing,
    status: kind === 'block' ? 'blocked' : paidNow ? 'paid' : 'pending',
    source, note: String(note || '').trim().slice(0, 300), createdBy,
  };
  if (kind === 'booking' && paidNow) doc.payment = { method: validatePaymentMethod(method), amount: pricing.total, paidAt: iso(nowMs), paidDate: today };

  const created = await repo.createReservation(doc);

  // Two people can press "book" at the same moment: if somebody else got in first, step back.
  const after = await repo.listReservations({ from: stay.checkIn, to: stay.checkOut });
  const earlier = conflictsFor(after, stay.slug, stay.checkIn, stay.checkOut, { excludeId: created.id, nowMs })
    .filter((r) => r.createdAt < created.createdAt || (r.createdAt === created.createdAt && r.id < created.id));
  if (earlier.length) {
    await repo.deleteReservation(created.id);
    throw new HttpError(409, 'room_booked');
  }

  if (kind === 'booking' && paidNow) await notify(source === 'online' ? 'reservation_paid' : 'reservation_manual', created, createdBy);
  return created;
}

// Called when the payment gateway confirms a payment (and by the dev-only fake payment). Safe to call twice.
export async function markReservationPaid(id, payment = {}, nowMs = Date.now()) {
  const res = await repo.getReservation(id);
  if (!res) throw new HttpError(404, 'not_found');
  if (res.status === 'paid') return res;
  if (res.status !== 'pending') throw new HttpError(409, 'not_pending');

  const existing = await repo.listReservations({ from: res.checkIn, to: res.checkOut });
  if (conflictsFor(existing, res.roomSlug, res.checkIn, res.checkOut, { excludeId: res.id, nowMs }).length) {
    // The hold expired and somebody else took the dates. If real money was taken this booking must be refunded by hand.
    throw new HttpError(409, 'room_booked_meanwhile');
  }
  const updated = await repo.updateReservation(id, {
    status: 'paid',
    payment: { method: payment.method || 'online', amount: res.pricing.total, paidAt: iso(nowMs), paidDate: todayTehran(new Date(nowMs)), authority: payment.authority || '', refId: payment.refId || '' },
  });
  await notify('reservation_paid', updated, payment.by || '');
  return updated;
}

// percent = what the guesthouse keeps (0 to 100). Pending (unpaid) bookings and blocks are simply released.
export async function cancelReservation(id, { percent, by, reason = '', nowMs = Date.now() }) {
  const res = await repo.getReservation(id);
  if (!res) throw new HttpError(404, 'not_found');
  if (res.status === 'cancelled') throw new HttpError(409, 'already_cancelled');

  const cancellation = { cancelledAt: iso(nowMs), cancelledDate: todayTehran(new Date(nowMs)), by, reason: String(reason).trim().slice(0, 200), deductionPercent: 0, deductionAmount: 0, refundAmount: 0 };
  if (res.kind === 'booking' && res.status === 'paid') {
    const p = Number(percent);
    if (!Number.isFinite(p) || p < 0 || p > 100) throw new ValidationError({ percent: 'errPercent' });
    const { deductionAmount, refundAmount } = settle(res.payment.amount, p);
    Object.assign(cancellation, { deductionPercent: p, deductionAmount, refundAmount });
  }
  const updated = await repo.updateReservation(id, { status: 'cancelled', cancellation });
  if (res.kind === 'booking') await notify('reservation_cancelled', updated, by);
  return updated;
}

export async function setDiscount(percent, by, nowMs = Date.now()) {
  const value = Math.round(Number(percent) * 10) / 10;
  if (!Number.isFinite(value) || value < -100 || value > 90) throw new ValidationError({ percent: 'errPercent' });
  const settings = await repo.getSettings();
  if (settings.discountPercent === value) return settings;
  const history = [{ percent: value, by, at: iso(nowMs) }, ...(settings.history || [])].slice(0, 20);
  return repo.saveSettings({ discountPercent: value, history });
}
