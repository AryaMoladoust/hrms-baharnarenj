// Checks that the app can reach MongoDB and shows what is inside.   Run:  node scripts/db-check.mjs
import fs from 'node:fs';
import mongoose from 'mongoose';

for (const file of ['.env.local', '.env']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
const uri = (process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017/baharnarenj';
console.log('Connecting to:', uri.replace(/\/\/([^:@/]+):([^@]+)@/, '//$1:****@'));

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
  const db = mongoose.connection.db;
  console.log('OK. Database:', mongoose.connection.name);
  const collections = await db.listCollections().toArray();
  if (!collections.length) console.log('The database is empty (normal before the first login).');
  for (const { name } of collections) console.log(` - ${name}: ${await db.collection(name).countDocuments()} document(s)`);
  const owners = await db.collection('owners').find({}, { projection: { username: 1, mustChangePassword: 1, lockedUntil: 1 } }).toArray();
  for (const o of owners) console.log(`   owner ${o.username}${o.mustChangePassword ? ' (still has the starting password)' : ''}${o.lockedUntil > Date.now() ? ' (locked)' : ''}`);
} catch (error) {
  console.error('\nCould NOT connect:', error.message);
  console.error('Is MongoDB running? On Windows: services.msc -> "MongoDB Server" must be "Running".');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
