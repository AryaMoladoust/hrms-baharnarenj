import { POLICIES } from '@/lib/policies';

// Hours from now until check-in (check-in time = POLICIES.checkInHour in Tehran, UTC+3:30).
export function hoursUntilCheckIn(checkIn, nowMs = Date.now()) {
  const [y, m, d] = checkIn.split('-').map(Number);
  const checkInMs = Date.UTC(y, m - 1, d, POLICIES.checkInHour, 0) - (3 * 60 + 30) * 60000;
  return (checkInMs - nowMs) / 3600000;
}

// The deduction the published policy asks for. The owner can still change the percent before confirming.
export function suggestCancellation({ paidAmount, checkIn, nowMs = Date.now() }) {
  const hours = hoursUntilCheckIn(checkIn, nowMs);
  const late = hours < POLICIES.lateCancellationHours;
  const percent = late ? POLICIES.lateCancellationPercent : POLICIES.cancellationPercent;
  return { late, hours: Math.floor(hours), ...settle(paidAmount, percent) };
}

export function settle(paidAmount, percent) {
  const deductionAmount = Math.round((paidAmount * percent) / 100);
  return { percent, deductionAmount, refundAmount: paidAmount - deductionAmount };
}
