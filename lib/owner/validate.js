import { rooms } from '@/lib/rooms';
import { GUEST_RULES } from '@/lib/rooms/prices';
import { isValidMobile, isValidNationalId, normalizeDigits } from '@/lib/booking/validation';
import { isIsoDate } from '@/lib/owner/dates';
import { EXPENSE_CATEGORIES, MAX_NIGHTS, PAYMENT_METHODS } from '@/lib/owner/constants';
import { daysBetween } from '@/lib/owner/dates';

export class ValidationError extends Error {
  constructor(errors) {
    super('validation');
    this.errors = errors; // { field: 'errorKey' }
  }
}

const roomSlugs = new Set(rooms.map((r) => r.slug));

// Normalizes Arabic letter forms, ZWNJ and extra spaces so "علي  رضایی" matches "علی رضایی".
export function normalizeName(value) {
  return String(value || '')
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
    .replace(/[\u200c\u200f\u200e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function cleanAddons(addons = {}) {
  const breakfast = Boolean(addons.breakfast) || Boolean(addons.hygiene); // the hygiene pack is sold together with breakfast
  return { breakfast, hygiene: Boolean(addons.hygiene) };
}

/**
 * Validates a stay. Returns clean values or throws ValidationError.
 * options: { today, allowPast } — customers cannot book in the past, the owner can record past stays.
 */
export function validateStay(input, { today, allowPast = false } = {}) {
  const errors = {};
  const slug = String(input.slug || '');
  if (!roomSlugs.has(slug)) errors.slug = 'errRoom';
  if (!isIsoDate(input.checkIn)) errors.checkIn = 'errDates';
  if (!isIsoDate(input.checkOut)) errors.checkOut = 'errDates';
  if (!errors.checkIn && !errors.checkOut) {
    if (input.checkOut <= input.checkIn) errors.checkOut = 'errDates';
    else if (daysBetween(input.checkIn, input.checkOut) > MAX_NIGHTS) errors.checkOut = 'errTooLong';
    else if (!allowPast && today && input.checkIn < today) errors.checkIn = 'errPast';
  }
  const guests = Number(input.guests);
  const rule = GUEST_RULES[slug];
  if (!Number.isInteger(guests) || guests < 1 || (rule && guests > rule.max)) errors.guests = 'errGuests';
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { slug, checkIn: input.checkIn, checkOut: input.checkOut, guests, addons: cleanAddons(input.addons) };
}

// strict = customers must give name, mobile and national ID. The owner may record a walk-in with only a name.
export function validateGuest(input, { strict }) {
  const errors = {};
  const fullName = String(input.fullName || '').trim().replace(/\s+/g, ' ');
  const mobile = normalizeDigits(input.mobile || '');
  const nationalId = normalizeDigits(input.nationalId || '');
  if (fullName.length < 3 || fullName.length > 80) errors.fullName = 'errName';
  if (strict ? !isValidMobile(mobile) : mobile && !isValidMobile(mobile)) errors.mobile = 'errMobile';
  if (strict ? !isValidNationalId(nationalId) : nationalId && !isValidNationalId(nationalId)) errors.nationalId = 'errNationalId';
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { fullName, mobile, nationalId };
}

export function validateExpense(input, { today }) {
  const errors = {};
  const amount = Number(input.amount);
  if (!isIsoDate(input.date)) errors.date = 'errDate';
  else if (today && input.date > today) errors.date = 'errFuture';
  if (!Number.isInteger(amount) || amount < 1 || amount > 10_000_000_000) errors.amount = 'errAmount';
  if (!EXPENSE_CATEGORIES.includes(input.category)) errors.category = 'errCategory';
  const note = String(input.note || '').trim().slice(0, 200);
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { date: input.date, amount, category: input.category, note };
}

export function validatePaymentMethod(method) {
  return PAYMENT_METHODS.includes(method) ? method : 'cash';
}

const WEAK = new Set(['12345678', '123456789', '1234567890', 'password', 'qwertyui', '11111111', '00000000']);
export function validateNewPassword(next, current) {
  const errors = {};
  const value = String(next || '');
  if (value.length < 8) errors.next = 'errPassShort';
  else if (WEAK.has(value.toLowerCase())) errors.next = 'errPassWeak';
  else if (value === current) errors.next = 'errPassSame';
  else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) errors.next = 'errPassMix';
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return value;
}
