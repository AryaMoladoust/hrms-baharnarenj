/**
 * STUB: "My reservations" lookup. Replace the body with:
 *   const res = await fetch('/api/reservations/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, nationalId }) });
 *   return res.json();
 *
 * Expected result: an array of
 *   { id, roomSlug, checkIn, checkOut, guests, status: 'paid' | 'pending' | 'cancelled', total }
 *
 * Privacy note: name + national ID is a weak "key" (anyone who knows both can see the bookings).
 * On the server, match both fields exactly, return only these fields (never other guests' data), and rate-limit the endpoint.
 */
export async function lookupReservations() {
  return [];
}
