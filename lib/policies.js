// Booking terms shown in the "Rules" section. Change the numbers here and the text updates in both languages.
export const POLICIES = {
  cancellationPercent: 15,       // deducted from the total stay when a booking is cancelled
  lateCancellationHours: 72,     // "late" = cancelled less than this many hours before check-in
  lateCancellationPercent: 30,   // deducted for late cancellation; the rest is refunded
  checkInHour: 14,               // Tehran hour used to count "hours before check-in" (assumption: confirm with the owner)
};
