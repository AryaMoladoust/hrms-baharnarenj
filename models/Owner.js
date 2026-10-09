import mongoose from 'mongoose';

const OwnerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: false },
    sessionVersion: { type: Number, default: 1 }, // bumped on password change: old sessions stop working
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Number, default: 0 },    // epoch ms
    lastLoginAt: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.models.Owner || mongoose.model('Owner', OwnerSchema);
