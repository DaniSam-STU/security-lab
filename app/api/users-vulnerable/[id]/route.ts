import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDb, queryAll } from '@/lib/db';
=======
import getDb, { queryAll } from '@/lib/db';
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
<<<<<<< HEAD

  // Fresh DB each request — seed users are always present
=======
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  const db = await getDb();
  const rows = queryAll(db, 'SELECT id, username, email, role, password FROM users WHERE id = ?', [id]);

  if (!rows.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

<<<<<<< HEAD
  // VULNERABLE: no auth check, returns password field
=======
  // VULNERABLE: no auth check, returns password field too
>>>>>>> 952f1a1312c7c2bc2a6bb76427221fff9a98639a
  return NextResponse.json({
    user: rows[0],
    safe: false,
    warning: 'No authentication or authorization check performed!',
  });
}
