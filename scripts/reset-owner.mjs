// Sets (or creates) an owner account with a new password and unlocks it.   Run:  node scripts/reset-owner.mjs milad NewPass123
import crypto from 'node:crypto';
import fs from 'node:fs';
import mongoose from 'mongoose';

// <hash> same format as lib/owner/password.js
const derive = (password, salt, length) => new Promise((resolve, reject) => crypto.scrypt(password, salt, length, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? reject(e) : resolve(k))));
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('base64')}$${(await derive(password, salt, 64)).toString('base64')}`;
}
// </hash>

const [username, password] = process.argv.slice(2);
if (!username || !password) { console.error('Usage: node scripts/reset-owner.mjs <username> <new password>'); process.exit(1); }

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
const uri = (process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017/baharnarenj';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
  const owners = mongoose.connection.db.collection('owners');
  const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const name = username.toLowerCase();
  const fields = { passwordHash: await hashPassword(password), mustChangePassword: !strong, failedAttempts: 0, lockedUntil: 0 };
  const existing = await owners.findOne({ username: name });
  if (existing) await owners.updateOne({ username: name }, { $set: fields, $inc: { sessionVersion: 1 } });
  else await owners.insertOne({ username: name, displayName: name, sessionVersion: 1, lastLoginAt: '', createdAt: new Date(), updatedAt: new Date(), ...fields });
  console.log(`${existing ? 'Updated' : 'Created'} owner "${name}". ${strong ? '' : 'The panel will keep reminding to choose a stronger password.'}`);
} catch (error) {
  console.error('Failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
