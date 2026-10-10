import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db/connect';

// Open /api/health/db in the browser to see whether the app can reach MongoDB.
// In development it also tells you the database name, how many owners exist and the exact error; in production it only says ok or not.
export const dynamic = 'force-dynamic';

export async function GET() {
  const dev = process.env.NODE_ENV !== 'production';
  try {
    const { connection } = await connectDb();
    if (!dev) return NextResponse.json({ ok: true });
    const owners = await connection.db.collection('owners').countDocuments();
    return NextResponse.json({ ok: true, database: connection.name, owners });
  } catch (error) {
    return NextResponse.json({ ok: false, ...(dev ? { error: error.message } : {}) }, { status: 503 });
  }
}
