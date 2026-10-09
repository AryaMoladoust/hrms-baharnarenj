import mongoose from 'mongoose';

// One connection per server instance. Vercel (serverless) re-uses it between requests, and hot reload in dev must not open a new one each time.
const cache = globalThis._baharnarenjMongo || (globalThis._baharnarenjMongo = { conn: null, promise: null });

export async function connectDb() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set (put your MongoDB Atlas connection string in .env.local)');
  cache.promise = cache.promise || mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null; // let the next request try again
    throw error;
  }
  return cache.conn;
}
