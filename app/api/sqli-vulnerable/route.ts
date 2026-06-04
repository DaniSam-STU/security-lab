import { NextRequest, NextResponse } from 'next/server';
import getDb, { queryRaw } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  const db = await getDb();

  // VULNERABLE: direct string concatenation into SQL query
  const query = `SELECT id, username, email, role FROM users WHERE username = '${username}'`;

  const { rows, error } = queryRaw(db, query);

  return NextResponse.json({
    query,
    results: rows,
    error,
    safe: false,
    rowCount: rows.length,
  });
}
