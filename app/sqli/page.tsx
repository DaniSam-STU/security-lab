'use client';
import { useState } from 'react';
import LabShell from '@/components/LabShell';
import styles from '../xss/page.module.css';

const PAYLOADS = [
  { label: 'Normal lookup',      value: 'alice',               note: 'Returns 1 row — normal' },
  { label: 'Always true',        value: "' OR '1'='1",         note: 'Dumps ALL users!' },
  { label: 'Comment bypass',     value: "' OR 1=1--",          note: 'SQL comment cancels closing quote' },
  { label: 'Admin login bypass', value: "admin'--",            note: 'Logs in as admin, skipping password' },
  { label: 'UNION dump passwords', value: "' UNION SELECT id, username, password, role FROM users--", note: 'Steals password column via UNION' },
  { label: 'Blind: true',        value: "' OR 1=1 AND '1'='1", note: 'Blind injection — condition always true' },
  { label: 'Non-existent user',  value: "zzznotauser",         note: 'Should return 0 rows' },
];

interface Row { id: number; username: string; email: string; role: string; [k: string]: any; }
interface Result { query: string; results: Row[]; error: string | null; safe: boolean; rowCount: number; }

export default function SQLiLab() {
  const [input, setInput]       = useState('');
  const [vulnResult, setVulnResult] = useState<Result | null>(null);
  const [safeResult, setSafeResult] = useState<Result | null>(null);
  const [loading, setLoading]   = useState(false);
  const [activeNote, setActiveNote] = useState('');

  const run = async (val?: string) => {
    const q = val ?? input;
    if (!q.trim()) return;
    setLoading(true);
    const [vr, sr] = await Promise.all([
      fetch('/api/sqli-vulnerable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: q }) }),
      fetch('/api/sqli-secure',     { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: q }) }),
    ]);
    setVulnResult(await vr.json());
    setSafeResult(await sr.json());
    setLoading(false);
  };

  const allCols = (rows: Row[]) => {
    const keys = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
    return Array.from(keys);
  };

  return (
    <LabShell
      title="SQL Injection"
      short="SQLi"
      cwe="CWE-89"
      severity="CRITICAL"
      description="SQL injection lets attackers manipulate database queries by injecting SQL syntax into user inputs. A single payload can bypass login, dump entire tables, or delete records — making it one of the most destructive vulnerabilities in web security."
      references={[
        { label: 'OWASP SQLi', href: 'https://owasp.org/www-community/attacks/SQL_Injection' },
        { label: 'PortSwigger', href: 'https://portswigger.net/web-security/sql-injection' },
      ]}
    >
      {/* Stats */}
      {(vulnResult || safeResult) && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: vulnResult && vulnResult.rowCount > 1 ? 'var(--red)' : 'var(--text)' }}>
              {vulnResult?.rowCount ?? 0}
            </span>
            <span className={styles.statLabel}>Rows leaked (vuln)</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: 'var(--green)' }}>{safeResult?.rowCount ?? 0}</span>
            <span className={styles.statLabel}>Rows returned (secure)</span>
          </div>
          {vulnResult && safeResult && vulnResult.rowCount !== safeResult.rowCount && (
            <>
              <div className={styles.statDiv} />
              <div className={styles.stat}>
                <span className={`badge badge-red`}>INJECTION DETECTED</span>
                <span className={styles.statLabel}>Behavior diverged</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Payload picker */}
      <div className={styles.payloadBar} style={{ flexDirection: 'column', gap: 8 }}>
        <span className={styles.payloadLabel}>Attack payloads:</span>
        <div className={styles.payloadBtns}>
          {PAYLOADS.map(p => (
            <button key={p.label} className={`btn btn-ghost ${styles.payloadBtn}`}
              onClick={() => { setInput(p.value); setActiveNote(p.note); run(p.value); }}>
              {p.label}
            </button>
          ))}
        </div>
        {activeNote && <div className={styles.sanitizedCode} style={{ color: 'var(--amber)', background: 'var(--amber-dim)' }}>ℹ {activeNote}</div>}
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Username input</label>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="e.g. alice  or  ' OR '1'='1" />
        </div>
        <button className="btn btn-red" onClick={() => run()} disabled={loading || !input.trim()}>
          {loading ? 'Running...' : 'Run query →'}
        </button>
      </div>

      {/* Panels */}
      <div className={styles.panels}>
        {/* Vulnerable */}
        <div className={`${styles.panel} ${styles.panelVuln}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
              <span className={styles.panelTitle}>Vulnerable</span>
              <span className="badge badge-red">String concatenation</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/sqli-vulnerable/route.ts</div>
            <pre className={styles.code}>{`// ❌ VULNERABLE
const query = \`SELECT * FROM users
  WHERE username = '\${username}'\`;
// User controls the SQL syntax!`}</pre>
          </div>

          <div className={styles.outputArea}>
            {vulnResult ? (
              <>
                <div className={styles.outputLabel}>Executed SQL:</div>
                <div className={`${styles.queryBox} ${styles.queryVuln}`}>{vulnResult.query}</div>

                {vulnResult.error && (
                  <div className={styles.errorBox}>SQL Error: {vulnResult.error}</div>
                )}
                {!vulnResult.error && vulnResult.results.length > 0 && (
                  <>
                    <div className={`${styles.rowCount} ${vulnResult.rowCount > 1 ? styles.rowCountDanger : ''}`}>
                      {vulnResult.rowCount} row(s) returned {vulnResult.rowCount > 1 ? '⚠ Data breach!' : ''}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.resultsTable}>
                        <thead>
                          <tr>{allCols(vulnResult.results).map(k => <th key={k}>{k}</th>)}</tr>
                        </thead>
                        <tbody>
                          {vulnResult.results.map((row, i) => (
                            <tr key={i}>
                              {allCols(vulnResult.results).map(k => (
                                <td key={k} className={k === 'password' ? styles.pwdCell : k === 'role' && row[k] === 'admin' ? styles.adminCell : ''}>
                                  {String(row[k] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {!vulnResult.error && vulnResult.results.length === 0 && (
                  <div className={styles.emptyState} style={{ marginTop: 12 }}>No rows returned.</div>
                )}
              </>
            ) : (
              <p className={styles.emptyState}>Choose a payload or type a username above.</p>
            )}
          </div>
        </div>

        {/* Secure */}
        <div className={`${styles.panel} ${styles.panelSafe}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span className={styles.panelTitle}>Secure</span>
              <span className="badge badge-green">Parameterized query</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/sqli-secure/route.ts</div>
            <pre className={styles.code}>{`// ✅ SECURE
const query = \`SELECT * FROM users
  WHERE username = ?\`;
db.prepare(query).all(username);
// Input is data, never SQL syntax`}</pre>
          </div>

          <div className={styles.outputArea}>
            {safeResult ? (
              <>
                <div className={styles.outputLabel}>Executed SQL:</div>
                <div className={`${styles.queryBox} ${styles.querySafe}`}>{safeResult.query}</div>

                {safeResult.error && (
                  <div className={styles.errorBox}>SQL Error: {safeResult.error}</div>
                )}
                {!safeResult.error && safeResult.results.length > 0 && (
                  <>
                    <div className={styles.rowCount}>{safeResult.rowCount} row(s) returned</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.resultsTable}>
                        <thead>
                          <tr>{allCols(safeResult.results).map(k => <th key={k}>{k}</th>)}</tr>
                        </thead>
                        <tbody>
                          {safeResult.results.map((row, i) => (
                            <tr key={i}>
                              {allCols(safeResult.results).map(k => (
                                <td key={k} className={k === 'role' && row[k] === 'admin' ? styles.adminCell : ''}>
                                  {String(row[k] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {!safeResult.error && safeResult.results.length === 0 && (
                  <div className={styles.emptyState} style={{ marginTop: 12 }}>No rows — injection attempt treated as literal string.</div>
                )}
              </>
            ) : (
              <p className={styles.emptyState}>Choose a payload or type a username above.</p>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className={styles.explanation}>
        <h3 className={styles.explainTitle}>How SQL injection works</h3>
        <div className={styles.explainGrid}>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>1</div>
            <div>
              <div className={styles.stepTitle}>Input contains SQL syntax</div>
              <div className={styles.stepDesc}>Attacker types <code>' OR '1'='1</code> in a login form. The quote character breaks out of the intended string.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>2</div>
            <div>
              <div className={styles.stepTitle}>Query is manipulated</div>
              <div className={styles.stepDesc}>The concatenated SQL becomes <code>WHERE username = '' OR '1'='1'</code> — always true for every row.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>3</div>
            <div>
              <div className={styles.stepTitle}>Database returns all rows</div>
              <div className={styles.stepDesc}>The condition is true for every user — all records are returned, or the attacker logs in as the first user (often admin).</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum} style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green-mid)' }}>✓</div>
            <div>
              <div className={styles.stepTitle}>Fix: parameterized queries</div>
              <div className={styles.stepDesc}>Use <code>?</code> placeholders. The database driver separates SQL code from data — injection syntax is never parsed as SQL.</div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
