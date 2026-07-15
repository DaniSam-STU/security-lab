import { NextRequest, NextResponse } from 'next/server';
import { getDb, queryRaw } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  // Fresh DB each request — seed data is always present
  const db = await getDb();

  // VULNERABLE: raw string concatenation into SQL
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
