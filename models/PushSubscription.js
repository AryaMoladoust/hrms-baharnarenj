import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    endpoint: { type: String, required: true, unique: true },
    subscription: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);
