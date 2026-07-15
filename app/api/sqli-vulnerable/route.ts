import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDb, queryRaw } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  // Fresh DB each request — seed data is always present
  const db = await getDb();

  // VULNERABLE: raw string concatenation into SQL
=======
import getDb, { queryRaw } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  const db = await getDb();

  // VULNERABLE: direct string concatenation into SQL query
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
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
