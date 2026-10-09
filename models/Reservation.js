import mongoose from 'mongoose';

// Dates (checkIn, checkOut, paidDate, cancelledDate) are plain 'YYYY-MM-DD' strings: calendar days in Tehran, no timezone surprises.
const ReservationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },            // e.g. BN-1405-0042
    kind: { type: String, enum: ['booking', 'block'], default: 'booking' },
    roomSlug: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nights: Number,
    guests: Number,
    addons: { breakfast: { type: Boolean, default: false }, hygiene: { type: Boolean, default: false } },
    guest: { fullName: String, mobile: String, nationalId: String },
    pricing: {
      lines: { type: [mongoose.Schema.Types.Mixed], default: [] },
      total: Number,
      quoteTotal: Number,
      discountPercent: { type: Number, default: 0 },
      overridden: { type: Boolean, default: false },
    },
    status: { type: String, enum: ['pending', 'paid', 'cancelled', 'blocked'], default: 'pending' },
    source: { type: String, enum: ['online', 'manual'], default: 'online' },
    payment: {
      method: String,       // online | cash | card | transfer | pos
      amount: Number,
      paidAt: String,       // ISO date-time
      paidDate: String,     // YYYY-MM-DD (Tehran)
      authority: String,    // gateway reference (filled by the payment step)
      refId: String,
    },
    cancellation: {
      cancelledAt: String,
      cancelledDate: String,
      deductionPercent: Number,
      deductionAmount: Number,
      refundAmount: Number,
      by: String,
      reason: String,
    },
    note: { type: String, default: '' },
    createdBy: { type: String, default: '' }, // owner username for manual bookings
  },
  { timestamps: true },
);

ReservationSchema.index({ roomSlug: 1, checkIn: 1, checkOut: 1 });
ReservationSchema.index({ 'guest.nationalId': 1 });
ReservationSchema.index({ 'payment.paidDate': 1 });
ReservationSchema.index({ 'cancellation.cancelledDate': 1 });

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
