'use client';
import { useState } from 'react';
import LabShell from '@/components/LabShell';
import styles from '../xss/page.module.css';

const USERS = [
  { id: 1, label: 'Your own profile (ID: 1 = alice)' },
  { id: 2, label: 'Another user (ID: 2 = bob)' },
  { id: 3, label: 'Admin account (ID: 3 = admin)' },
  { id: 4, label: 'User ID: 4 = charlie' },
  { id: 99, label: 'Non-existent (ID: 99)' },
];

export default function IDORLab() {
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [vulnResult, setVulnResult]     = useState<any>(null);
  const [safeResult, setSafeResult]     = useState<any>(null);
  const [loading, setLoading]           = useState(false);

  const lookup = async (id: number) => {
    setSelectedId(id);
    setLoading(true);
    const [vr, sr] = await Promise.all([
      fetch(`/api/users-vulnerable/${id}`),
      fetch(`/api/users-secure/${id}`, { headers: { 'x-user-id': '1' } }), // logged in as alice (id=1)
    ]);
    setVulnResult(await vr.json());
    setSafeResult(await sr.json());
    setLoading(false);
  };

  return (
    <LabShell
      title="Insecure Direct Object Reference"
      short="IDOR"
      cwe="CWE-639"
      severity="HIGH"
      description="IDOR occurs when an application exposes internal object references (IDs, filenames) in URLs without checking whether the requester is authorized to access them. Incrementing a user ID by 1 can reveal another user's private data."
      references={[
        { label: 'OWASP IDOR', href: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References' },
        { label: 'PortSwigger', href: 'https://portswigger.net/web-security/access-control/idor' },
      ]}
    >
      {/* Stats */}
      {(vulnResult || safeResult) && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: vulnResult?.user ? 'var(--red)' : 'var(--text)' }}>
              {vulnResult?.user ? 'EXPOSED' : 'BLOCKED'}
            </span>
            <span className={styles.statLabel}>Vulnerable endpoint</span>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: safeResult?.blocked ? 'var(--green)' : safeResult?.user ? 'var(--blue)' : 'var(--text)' }}>
              {safeResult?.blocked ? 'BLOCKED' : safeResult?.user ? 'ALLOWED' : 'ERROR'}
            </span>
            <span className={styles.statLabel}>Secure endpoint</span>
          </div>
          {vulnResult?.user?.password && (
            <>
              <div className={styles.statDiv} />
              <div className={styles.stat}>
                <span className={`badge badge-red`}>PASSWORD LEAKED</span>
                <span className={styles.statLabel}>Vulnerable returns plaintext password</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ID picker */}
      <div style={{ marginBottom: 24 }}>
        <div className={styles.payloadLabel} style={{ marginBottom: 10 }}>
          You are logged in as <code style={{ color: 'var(--blue)' }}>alice (ID: 1)</code> — try accessing other users:
        </div>
        <div className={styles.idGrid}>
          {USERS.map(u => (
            <button
              key={u.id}
              className={`btn ${selectedId === u.id ? 'btn-red' : 'btn-outline'} ${styles.idBtn}`}
              onClick={() => lookup(u.id)}
              disabled={loading}
            >
              /api/users/{u.id}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          {USERS.find(u => u.id === selectedId)?.label || 'Select a user ID above'}
        </div>
      </div>

      {/* Panels */}
      <div className={styles.panels}>
        {/* Vulnerable */}
        <div className={`${styles.panel} ${styles.panelVuln}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
              <span className={styles.panelTitle}>Vulnerable</span>
              <span className="badge badge-red">No auth check</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/users-vulnerable/[id]/route.ts</div>
            <pre className={styles.code}>{`// ❌ VULNERABLE
export async function GET(req, { params }) {
  // No session check!
  // No ownership check!
  const user = db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).get(params.id);
  // Returns password too!
  return json({ user });
}`}</pre>
          </div>

          <div className={styles.outputArea}>
            {loading && <p className={styles.emptyState}>Fetching...</p>}
            {!loading && !vulnResult && <p className={styles.emptyState}>Click a user ID above.</p>}
            {!loading && vulnResult && (
              vulnResult.error ? (
                <div className={styles.errorBox}>{vulnResult.error}</div>
              ) : (
                <>
                  <div className={styles.outputLabel}>Response from /api/users-vulnerable/{selectedId}:</div>
                  {vulnResult.warning && (
                    <div className={styles.errorBox} style={{ marginBottom: 12 }}>⚠ {vulnResult.warning}</div>
                  )}
                  <table className={styles.resultsTable}>
                    <tbody>
                      {Object.entries(vulnResult.user || {}).map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ color: 'var(--text3)', width: 80 }}>{k}</td>
                          <td className={k === 'password' ? styles.pwdCell : k === 'role' && v === 'admin' ? styles.adminCell : ''}>
                            {String(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            )}
          </div>
        </div>

        {/* Secure */}
        <div className={`${styles.panel} ${styles.panelSafe}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span className={styles.panelTitle}>Secure</span>
              <span className="badge badge-green">Ownership verified</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/users-secure/[id]/route.ts</div>
            <pre className={styles.code}>{`// ✅ SECURE
const loggedInId = session.userId; // from cookie
if (user.id !== loggedInId && !isAdmin) {
  return 403 Access Denied;
}
// Never return password field
const { password, ...safe } = user;
return json({ user: safe });`}</pre>
          </div>

          <div className={styles.outputArea}>
            {loading && <p className={styles.emptyState}>Fetching...</p>}
            {!loading && !safeResult && <p className={styles.emptyState}>Click a user ID above.</p>}
            {!loading && safeResult && (
              safeResult.blocked ? (
                <div className={styles.blockedBox}>
                  🛡 {safeResult.error}
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--blue)' }}>
                    Logged in as alice (ID 1) — you can only access /api/users/1
                  </div>
                </div>
              ) : safeResult.error ? (
                <div className={styles.errorBox}>{safeResult.error}</div>
              ) : (
                <>
                  <div className={styles.outputLabel}>Safe response — no password field:</div>
                  {safeResult.note && (
                    <div className={styles.successBox} style={{ marginBottom: 12 }}>✓ {safeResult.note}</div>
                  )}
                  <table className={styles.resultsTable}>
                    <tbody>
                      {Object.entries(safeResult.user || {}).map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ color: 'var(--text3)', width: 80 }}>{k}</td>
                          <td className={k === 'role' && v === 'admin' ? styles.adminCell : ''}>{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            )}
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <h3 className={styles.explainTitle}>How IDOR works</h3>
        <div className={styles.explainGrid}>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>1</div>
            <div>
              <div className={styles.stepTitle}>Sequential IDs in URLs</div>
              <div className={styles.stepDesc}>App exposes <code>/profile?id=1042</code>. Attacker changes it to <code>1043</code>, <code>1044</code>… and iterates through all users.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>2</div>
            <div>
              <div className={styles.stepTitle}>No authorization check</div>
              <div className={styles.stepDesc}>The server fetches the record by ID without verifying the requester owns it. Any authenticated user can access any record.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>3</div>
            <div>
              <div className={styles.stepTitle}>Sensitive data exposed</div>
              <div className={styles.stepDesc}>PII, passwords, payment info, messages — anything in the database row is returned, including fields never shown in the UI.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum} style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green-mid)' }}>✓</div>
            <div>
              <div className={styles.stepTitle}>Fix: always check ownership</div>
              <div className={styles.stepDesc}>Compare the requested resource's owner ID against the authenticated user's session ID. Use UUIDs instead of sequential integers to prevent enumeration.</div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
