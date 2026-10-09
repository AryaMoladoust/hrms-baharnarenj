import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    amount: { type: Number, required: true },            // Toman
    category: { type: String, required: true },
    note: { type: String, default: '' },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
