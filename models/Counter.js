import mongoose from 'mongoose';

// Used to number reservations per Jalali year: BN-1405-0001, BN-1405-0002, ...
const CounterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });

export default mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
