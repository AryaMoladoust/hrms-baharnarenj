import mongoose from 'mongoose';

// One connection per server instance. Vercel (serverless) re-uses it between requests, and hot reload in dev must not open a new one each time.
const cache = globalThis._baharnarenjMongo || (globalThis._baharnarenjMongo = { conn: null, promise: null });

// While developing, if MONGODB_URI is not set the app talks to a MongoDB running on your own computer.
// In production the variable is required: the app must never silently use a local database there.
export const LOCAL_URI = 'mongodb://127.0.0.1:27017/baharnarenj';

export function resolveUri() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (uri) return uri;
  if (process.env.NODE_ENV !== 'production') return LOCAL_URI;
  throw new Error('MONGODB_URI is not set (add your MongoDB connection string to the environment variables)');
}

export async function connectDb() {
  if (cache.conn) return cache.conn;
  const dev = process.env.NODE_ENV !== 'production';
  cache.promise = cache.promise || mongoose.connect(resolveUri(), {
    bufferCommands: false,
    serverSelectionTimeoutMS: dev ? 5000 : 8000,
    family: 4, // "localhost" can resolve to IPv6 on Windows while MongoDB listens on IPv4 only; this avoids that trap
  });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // let the next request try again
    throw error;
  }
  return cache.conn;
}
