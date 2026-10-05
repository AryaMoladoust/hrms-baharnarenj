/**
 * STUB. Replace with:
 *   const res = await fetch('/api/reservations', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
 *   return res.json();   // expected: { ok: true, paymentUrl }
 * then redirect the browser to paymentUrl (the payment gateway).
 */
export async function submitReservation(payload) {
  return { ok: true, paymentUrl: null, payload };
}
