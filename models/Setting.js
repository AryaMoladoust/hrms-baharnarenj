import mongoose from 'mongoose';

// A single document (key: 'main') holding the owner-controlled settings.
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  discountPercent: { type: Number, default: 0 }, // positive = discount on every room, negative = price increase
  history: { type: [mongoose.Schema.Types.Mixed], default: [] }, // [{ percent, by, at }], newest first, last 20
});

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
