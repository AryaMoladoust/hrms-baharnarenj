import { NextResponse } from 'next/server';
import * as repo from '@/lib/db/repo';
import { handle, HttpError, readJson, requireOwnerApi } from '@/lib/owner/api';
import { suggestCancellation } from '@/lib/owner/cancellation';
import { cancelReservation, markReservationPaid } from '@/lib/owner/services';
import { validatePaymentMethod } from '@/lib/owner/validate';

export const GET = handle(async (request, { params }) => {
  await requireOwnerApi(request);
  const { id } = await params;
  const reservation = await repo.getReservation(id);
  if (!reservation) throw new HttpError(404, 'not_found');
  const cancelSuggestion = reservation.kind === 'booking' && reservation.status === 'paid'
    ? suggestCancellation({ paidAmount: reservation.payment.amount, checkIn: reservation.checkIn })
    : null;
  return NextResponse.json({ reservation, cancelSuggestion });
});

// body: { action: 'cancel', percent, reason } | { action: 'pay', method } | { action: 'note', note }
export const PATCH = handle(async (request, { params }) => {
  const owner = await requireOwnerApi(request);
  const { id } = await params;
  const body = await readJson(request);

  if (body.action === 'cancel') return NextResponse.json({ ok: true, reservation: await cancelReservation(id, { percent: body.percent, reason: body.reason, by: owner.username }) });
  if (body.action === 'pay') return NextResponse.json({ ok: true, reservation: await markReservationPaid(id, { method: validatePaymentMethod(body.method), by: owner.username }) });
  if (body.action === 'note') {
    const updated = await repo.updateReservation(id, { note: String(body.note || '').trim().slice(0, 300) });
    if (!updated) throw new HttpError(404, 'not_found');
    return NextResponse.json({ ok: true, reservation: updated });
  }
  throw new HttpError(400, 'bad_action');
});
