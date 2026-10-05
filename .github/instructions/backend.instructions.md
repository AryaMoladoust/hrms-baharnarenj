---
applyTo: "app/api/**/*.js,lib/**/*.js,models/**/*.js"
---
# Backend and domain instructions

- Treat availability and reservation validation as server-side responsibilities.
- Keep MongoDB/Mongoose access out of presentational components.
- Validate and sanitize user-controlled input at API boundaries.
- Never return unnecessary personal data, especially full national IDs.
- Reservation lookup endpoints must resist enumeration and abuse with rate limiting and minimal responses.
- Design reservation creation to prevent race-condition double bookings.
- Keep payment provider integration behind a service/adapter boundary.
- Keep secrets in environment variables and fail safely when required configuration is missing.
- Return predictable JSON responses and appropriate HTTP status codes from API routes.
