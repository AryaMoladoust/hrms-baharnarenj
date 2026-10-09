/**
 * "My reservations": POST /api/reservations/lookup with the guest's name and national ID.
 * Returns an array of { id, code, roomSlug, checkIn, checkOut, guests, status: 'paid' | 'pending' | 'cancelled', total }.
 * Throws when the request fails (the page shows an error message).
 */
export async function lookupReservations({ fullName, nationalId }) {
  const res = await fetch('/api/reservations/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, nationalId }) });
  if (!res.ok) throw new Error(`lookup ${res.status}`);
  return (await res.json()).reservations;
}
