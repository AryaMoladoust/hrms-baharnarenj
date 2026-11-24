
/**
 * Sends the booking form to the server (POST /api/reservations).
 */
export async function submitReservation(payload) {
  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        ok: true,
        code: data.code,
        paid: Boolean(data.paid),
        paymentUrl: data.paymentUrl || null,
        paymentAuthority: data.paymentAuthority || null,
      };
    }

    return {
      ok: false,
      error: data.error || 'server',
      fields: data.fields,
    };
  } catch {
    return { ok: false, error: 'server' };
  }
}
