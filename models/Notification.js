import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // reservation_paid | reservation_manual | reservation_cancelled
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    readBy: { type: [String], default: [] }, // usernames that have read it
  },
  { timestamps: true },
);
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
