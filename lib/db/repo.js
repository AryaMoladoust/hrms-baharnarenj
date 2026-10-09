import mongoose from 'mongoose';
import { connectDb } from '@/lib/db/connect';
import Owner from '@/models/Owner';
import Reservation from '@/models/Reservation';
import Expense from '@/models/Expense';
import Setting from '@/models/Setting';
import Notification from '@/models/Notification';
import PushSubscription from '@/models/PushSubscription';
import Counter from '@/models/Counter';

/**
 * The only file that talks to MongoDB. Everything else (API routes, services) calls these functions and gets plain objects
 * with an `id` string, so the database could be swapped without touching the rest of the app.
 */

function plain(doc) {
  if (!doc) return null;
  const out = { ...doc, id: String(doc._id) };
  delete out._id;
  delete out.__v;
  for (const key of ['createdAt', 'updatedAt']) if (out[key] instanceof Date) out[key] = out[key].toISOString();
  return out;
}
const many = (docs) => docs.map(plain);
const validId = (id) => mongoose.isValidObjectId(id);
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- owners
export async function countOwners() { await connectDb(); return Owner.countDocuments(); }
export async function findOwnerByUsername(username) { await connectDb(); return plain(await Owner.findOne({ username: String(username).toLowerCase() }).lean()); }
export async function createOwner(doc) { await connectDb(); return plain((await Owner.create(doc)).toObject()); }
export async function updateOwner(username, patch, inc) {
  await connectDb();
  const update = { $set: patch };
  if (inc) update.$inc = inc;
  return plain(await Owner.findOneAndUpdate({ username: String(username).toLowerCase() }, update, { new: true }).lean());
}

// ---------- settings
export async function getSettings() {
  await connectDb();
  const doc = await Setting.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main', discountPercent: 0, history: [] } }, { new: true, upsert: true }).lean();
  return plain(doc);
}
export async function saveSettings(patch) {
  await connectDb();
  return plain(await Setting.findOneAndUpdate({ key: 'main' }, { $set: patch }, { new: true, upsert: true }).lean());
}

// ---------- reservations
// from/to: only reservations whose stay overlaps [from, to). status: one status or an array. q: text search on code / guest.
export async function listReservations({ from, to, status, q, limit = 500 } = {}) {
  await connectDb();
  const filter = {};
  if (from && to) { filter.checkIn = { $lt: to }; filter.checkOut = { $gt: from }; }
  if (status) filter.status = Array.isArray(status) ? { $in: status } : status;
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ code: rx }, { 'guest.fullName': rx }, { 'guest.mobile': rx }, { 'guest.nationalId': rx }];
  }
  return many(await Reservation.find(filter).sort({ checkIn: -1, createdAt: -1 }).limit(limit).lean());
}
// Reservations with a payment or a refund inside [from, to] (inclusive dates): the input of the finance reports.
export async function listFinanceReservations({ from, to }) {
  await connectDb();
  return many(await Reservation.find({ $or: [{ 'payment.paidDate': { $gte: from, $lte: to } }, { 'cancellation.cancelledDate': { $gte: from, $lte: to } }] }).lean());
}
export async function getReservation(id) { await connectDb(); return validId(id) ? plain(await Reservation.findById(id).lean()) : null; }
export async function createReservation(doc) { await connectDb(); return plain((await Reservation.create(doc)).toObject()); }
export async function updateReservation(id, patch) {
  await connectDb();
  return validId(id) ? plain(await Reservation.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()) : null;
}
export async function deleteReservation(id) { await connectDb(); if (validId(id)) await Reservation.findByIdAndDelete(id); }
export async function listReservationsByNationalId(nationalId) {
  await connectDb();
  return many(await Reservation.find({ kind: 'booking', 'guest.nationalId': nationalId }).sort({ checkIn: -1 }).limit(50).lean());
}
export async function nextReservationCode(jalaliYear) {
  await connectDb();
  const counter = await Counter.findOneAndUpdate({ _id: `res-${jalaliYear}` }, { $inc: { seq: 1 } }, { new: true, upsert: true }).lean();
  return `BN-${jalaliYear}-${String(counter.seq).padStart(4, '0')}`;
}

// ---------- expenses
export async function listExpenses({ from, to } = {}) {
  await connectDb();
  const filter = from && to ? { date: { $gte: from, $lte: to } } : {};
  return many(await Expense.find(filter).sort({ date: -1, createdAt: -1 }).limit(1000).lean());
}
export async function getExpense(id) { await connectDb(); return validId(id) ? plain(await Expense.findById(id).lean()) : null; }
export async function createExpense(doc) { await connectDb(); return plain((await Expense.create(doc)).toObject()); }
export async function updateExpense(id, patch) { await connectDb(); return validId(id) ? plain(await Expense.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()) : null; }
export async function deleteExpense(id) { await connectDb(); if (validId(id)) await Expense.findByIdAndDelete(id); }

// ---------- notifications
export async function createNotification(doc) { await connectDb(); return plain((await Notification.create(doc)).toObject()); }
export async function listNotifications({ limit = 50 } = {}) { await connectDb(); return many(await Notification.find().sort({ createdAt: -1 }).limit(limit).lean()); }
export async function countUnread(username) { await connectDb(); return Notification.countDocuments({ readBy: { $ne: username } }); }
export async function markNotificationsRead({ ids, username }) {
  await connectDb();
  const filter = ids?.length ? { _id: { $in: ids.filter(validId) } } : {};
  await Notification.updateMany(filter, { $addToSet: { readBy: username } });
}

// ---------- push subscriptions
export async function savePushSubscription({ username, endpoint, subscription }) {
  await connectDb();
  await PushSubscription.findOneAndUpdate({ endpoint }, { $set: { username, subscription } }, { upsert: true });
}
export async function listPushSubscriptions() { await connectDb(); return many(await PushSubscription.find().lean()); }
export async function removePushSubscription(endpoint) { await connectDb(); await PushSubscription.deleteOne({ endpoint }); }
