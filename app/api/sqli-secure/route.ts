import { NextRequest, NextResponse } from 'next/server';
import getDb, { queryAll } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  const db = await getDb();

  // SECURE: parameterized query — input is treated as data, never as SQL
  const query = `SELECT id, username, email, role FROM users WHERE username = ?`;

  let results: any[] = [];
  let error: string | null = null;

  try {
    results = queryAll(db, query, [username]);
  } catch (err: any) {
    error = err.message;
  }

  return NextResponse.json({
    query: `${query}  -- bound param: "${username}"`,
    results,
    error,
    safe: true,
    rowCount: results.length,
  });
}
