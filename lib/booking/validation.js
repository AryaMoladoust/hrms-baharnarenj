export function normalizeDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function isValidMobile(value) {
  return /^09\d{9}$/.test(normalizeDigits(value));
}

// Iranian national code checksum.
export function isValidNationalId(value) {
  const code = normalizeDigits(value);
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const sum = code.slice(0, 9).split('').reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);
  const remainder = sum % 11;
  const check = remainder < 2 ? remainder : 11 - remainder;
  return check === Number(code[9]);
}
