# Database design

MongoDB is the planned application database. Mongoose is the planned ODM.

## Collections
### users
Owner/admin and, if needed later, customer account data. Do not store unnecessary personal information.

### rooms
Suggested fields:
- name
- slug
- type (`room` / `suite`)
- description
- capacity
- amenities
- gallery/image URLs
- active
- base price

### reservations
Suggested fields:
- guestName
- nationalId (sensitive; protect access)
- phone
- roomId
- checkIn
- checkOut
- guests
- amount
- discount / pricing adjustment
- paymentStatus
- reservationStatus
- trackingCode
- createdAt / updatedAt

Important: date-range overlap rules must prevent two active reservations for the same room from occupying overlapping nights.

### payments
Suggested fields:
- reservationId
- provider
- authority/reference
- amount
- status
- paidAt
- raw gateway identifiers only when genuinely required

### expenses
Suggested fields:
- date
- category
- description
- amount
- createdAt

### priceRules
Suggested fields:
- name
- startsAt
- endsAt
- type (percentage/fixed)
- value
- scope (all rooms or selected rooms)
- active

### notifications
Suggested fields:
- type
- title
- message
- relatedReservationId
- readAt
- createdAt

### settings
Application-level settings that should not be duplicated throughout code.

## Security rules
- Never expose full national IDs in customer-facing responses.
- Reservation retrieval by name + national ID needs rate limiting and enumeration protection.
- Validate all date, numeric, identifier, and text fields server-side.
- Do not trust client-calculated price or availability.
- Keep secrets only in environment variables.
