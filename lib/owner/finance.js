import { addDays } from '@/lib/dates';
import { eachDay, jalaliMonthBounds, jalaliMonthKey, jalaliWeekBounds, daysBetween } from '@/lib/owner/dates';
import { MAX_REPORT_DAYS } from '@/lib/owner/constants';

/**
 * Money in = payments received on the day they were received (cash basis); money back = refunds on the day they were paid back.
 * Blocks (maintenance etc.) and unpaid or cancelled-before-payment bookings never count.
 */
export function incomeEvents(reservations) {
  const events = [];
  for (const r of reservations) {
    if (r.kind === 'block') continue;
    const paid = r.payment?.amount > 0 && r.payment?.paidDate;
    if (paid && (r.status === 'paid' || r.status === 'cancelled')) {
      events.push({ date: r.payment.paidDate, amount: r.payment.amount, type: 'payment', roomSlug: r.roomSlug, reservationId: r.id, code: r.code });
    }
    if (r.status === 'cancelled' && r.cancellation?.refundAmount > 0 && r.cancellation?.cancelledDate) {
      events.push({ date: r.cancellation.cancelledDate, amount: -r.cancellation.refundAmount, type: 'refund', roomSlug: r.roomSlug, reservationId: r.id, code: r.code });
    }
  }
  return events;
}

function bucketOf(date, group) {
  if (group === 'week') { const w = jalaliWeekBounds(date); return { key: w.from, from: w.from, to: w.to }; }
  if (group === 'month') { const m = jalaliMonthBounds(date); return { key: jalaliMonthKey(date), from: m.from, to: m.to }; }
  return { key: date, from: date, to: date };
}

/**
 * Income / expenses / net for a date range (inclusive), grouped by day, Jalali week (Saturday start) or Jalali month.
 * Also: expenses by category and income by room.
 */
export function buildReport({ reservations, expenses, from, to, group = 'day' }) {
  if (from > to) throw new RangeError('from must not be after to');
  if (daysBetween(from, to) > MAX_REPORT_DAYS) throw new RangeError('range too long');

  const events = incomeEvents(reservations).filter((e) => e.date >= from && e.date <= to);
  const spent = expenses.filter((e) => e.date >= from && e.date <= to);

  const buckets = new Map();
  for (const day of eachDay(from, to)) {
    const b = bucketOf(day, group);
    if (!buckets.has(b.key)) buckets.set(b.key, { key: b.key, from: b.from < from ? from : b.from, to: b.to > to ? to : b.to, income: 0, expense: 0, net: 0 });
  }
  for (const e of events) buckets.get(bucketOf(e.date, group).key).income += e.amount;
  for (const x of spent) buckets.get(bucketOf(x.date, group).key).expense += x.amount;
  const series = [...buckets.values()].map((b) => ({ ...b, net: b.income - b.expense }));

  const income = events.reduce((sum, e) => sum + e.amount, 0);
  const expense = spent.reduce((sum, x) => sum + x.amount, 0);

  const byCategory = new Map();
  for (const x of spent) byCategory.set(x.category, (byCategory.get(x.category) || 0) + x.amount);
  const byRoom = new Map();
  for (const e of events) byRoom.set(e.roomSlug, (byRoom.get(e.roomSlug) || 0) + e.amount);

  return {
    from, to, group,
    totals: { income, expense, net: income - expense, bookings: events.filter((e) => e.type === 'payment').length },
    series,
    expensesByCategory: [...byCategory].map(([category, amount]) => ({ category, amount, share: expense ? amount / expense : 0 })).sort((a, b) => b.amount - a.amount),
    incomeByRoom: [...byRoom].map(([slug, amount]) => ({ slug, amount })).sort((a, b) => b.amount - a.amount),
  };
}

// "Ready" monthly reports: one line per Jalali month. months = [{ y, m, from, to }] (see recentJalaliMonths).
export function monthlyTotals({ reservations, expenses, months }) {
  const events = incomeEvents(reservations);
  return months.map((month) => {
    const income = events.filter((e) => e.date >= month.from && e.date <= month.to).reduce((s, e) => s + e.amount, 0);
    const expense = expenses.filter((x) => x.date >= month.from && x.date <= month.to).reduce((s, x) => s + x.amount, 0);
    return { ...month, income, expense, net: income - expense };
  });
}

export { addDays };
