import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const wasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  // Convert Buffer to ArrayBuffer to satisfy sql.js types
  const wasmBinary: ArrayBuffer = wasmBuffer.buffer.slice(
    wasmBuffer.byteOffset,
    wasmBuffer.byteOffset + wasmBuffer.byteLength
  ) as ArrayBuffer;

  const SQL = await initSqlJs({ wasmBinary });
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO users (username, email, role, password) VALUES
      ('alice',  'alice@acme.com',  'user',  'hunter2'),
      ('bob',    'bob@acme.com',    'user',  'password123'),
      ('admin',  'admin@acme.com',  'admin', 'sup3rsecr3t'),
      ('charlie','charlie@acme.com','user',  'qwerty');
    INSERT INTO comments (author, body) VALUES
      ('alice',   'Great post!'),
      ('bob',     'Thanks for sharing.'),
      ('charlie', 'Very helpful article.');
  `);

  return db;
}

export function queryAll(db: Database, sql: string, params: any[] = []): Record<string, any>[] {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows: Record<string, any>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as Record<string, any>);
    }
    stmt.free();
    return rows;
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export function queryRun(db: Database, sql: string, params: any[] = []): void {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

export function queryRaw(db: Database, sql: string): { rows: Record<string, any>[]; error: string | null } {
  try {
    const results = db.exec(sql);
    if (!results.length) return { rows: [], error: null };
    const { columns, values } = results[0];
    const rows = values.map(row =>
      Object.fromEntries(columns.map((col, i) => [col, row[i]]))
    );
    return { rows, error: null };
  } catch (e: any) {
    return { rows: [], error: e.message };
  }
}

export default getDb;
