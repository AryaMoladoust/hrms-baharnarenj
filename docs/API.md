# API plan

The API is intentionally minimal in the starter. `GET /api/health` exists as a basic runtime check.

Planned domains:

```text
/api/rooms
/api/availability
/api/reservations
/api/my-reservations
/api/payments
/api/owner/reservations
/api/owner/rooms
/api/owner/pricing
/api/owner/expenses
/api/owner/reports
/api/owner/notifications
```

## API principles
- Validate request bodies and query parameters at the boundary.
- Return predictable JSON structures.
- Use correct HTTP status codes.
- Keep owner authorization separate from customer-facing access.
- Never allow a customer endpoint to enumerate arbitrary reservations.
- Server calculates authoritative prices and availability.
- Payment callbacks/webhooks must verify the gateway response before marking a reservation paid.
- Avoid leaking internal database errors to clients.

Do not implement every planned endpoint at once. Add one vertical slice at a time and validate it end-to-end.
