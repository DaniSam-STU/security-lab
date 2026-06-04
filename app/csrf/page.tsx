'use client';
import { useState, useEffect } from 'react';
import LabShell from '@/components/LabShell';
import styles from '../xss/page.module.css';

interface Balances { alice: number; bob: number; admin: number; }

export default function CSRFLab() {
  const [balances, setBalances]   = useState<Balances>({ alice: 5000, bob: 2500, admin: 10000 });
  const [from, setFrom]           = useState('alice');
  const [to, setTo]               = useState('admin');
  const [amount, setAmount]       = useState(500);
  const [vulnResult, setVulnResult] = useState<any>(null);
  const [safeResult, setSafeResult] = useState<any>(null);
  const [loadingVuln, setLoadingVuln] = useState(false);
  const [loadingSafe, setLoadingSafe] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf-secure?action=token').then(r => r.json()).then(d => setCsrfToken(d.csrfToken || ''));
  }, []);

  const refreshBalances = async () => {
    const r = await fetch('/api/csrf-vulnerable');
    const d = await r.json();
    setBalances(d.balances || balances);
  };

  const runVulnerable = async () => {
    setLoadingVuln(true);
    // Notice: NO csrfToken sent — simulates a cross-origin forged request
    const r = await fetch('/api/csrf-vulnerable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount }),
    });
    const d = await r.json();
    setVulnResult(d);
    if (d.balances) setBalances(d.balances);
    setLoadingVuln(false);
  };

  const runSecure = async () => {
    setLoadingSafe(true);
    // Simulate: no token (forged request)
    const r = await fetch('/api/csrf-secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount }),  // no csrfToken
    });
    const d = await r.json();
    setSafeResult(d);
    // Refresh token for next attempt
    fetch('/api/csrf-secure?action=token').then(r => r.json()).then(d => setCsrfToken(d.csrfToken || ''));
    setLoadingSafe(false);
  };

  const runSecureWithToken = async () => {
    setLoadingSafe(true);
    // Legitimate request WITH token
    const r = await fetch('/api/csrf-secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, amount, csrfToken }),
    });
    const d = await r.json();
    setSafeResult(d);
    if (d.balances) setBalances(d.balances);
    // Get a new token
    fetch('/api/csrf-secure?action=token').then(r => r.json()).then(d => setCsrfToken(d.csrfToken || ''));
    setLoadingSafe(false);
  };

  return (
    <LabShell
      title="Cross-Site Request Forgery"
      short="CSRF"
      cwe="CWE-352"
      severity="MEDIUM"
      description="CSRF tricks authenticated users into unknowingly performing actions on a trusted site. A malicious page sends a forged request to your app — and since the user is already logged in, the browser includes their cookies automatically."
      references={[
        { label: 'OWASP CSRF', href: 'https://owasp.org/www-community/attacks/csrf' },
        { label: 'PortSwigger', href: 'https://portswigger.net/web-security/csrf' },
      ]}
    >
      {/* Balance cards */}
      <div className={styles.balanceGrid}>
        {(Object.entries(balances) as [string, number][]).map(([user, bal]) => (
          <div key={user} className={styles.balanceCard}>
            <div className={styles.balanceName}>{user}</div>
            <div className={styles.balanceAmt} style={{ color: bal < 1000 ? 'var(--red)' : 'var(--text)' }}>${bal.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Transfer form */}
      <div className={styles.inputRow} style={{ marginBottom: 24 }}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <option value="alice">alice</option>
            <option value="bob">bob</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>To</label>
          <select value={to} onChange={e => setTo(e.target.value)} style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <option value="admin">admin</option>
            <option value="alice">alice</option>
            <option value="bob">bob</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Amount ($)</label>
          <input type="text" value={String(amount)} onChange={e => setAmount(Number(e.target.value) || 0)} style={{ width: 100 }} />
        </div>
      </div>

      <div className={styles.panels}>
        {/* Vulnerable */}
        <div className={`${styles.panel} ${styles.panelVuln}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
              <span className={styles.panelTitle}>Vulnerable</span>
              <span className="badge badge-red">No CSRF token</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/csrf-vulnerable/route.ts</div>
            <pre className={styles.code}>{`// ❌ VULNERABLE
// No origin check
// No CSRF token validation
// Any site can POST this endpoint
export async function POST(req) {
  const { from, to, amount } = await req.json();
  // Processes any request!
  transferFunds(from, to, amount);
}`}</pre>
          </div>

          <div className={styles.outputArea}>
            <p className={styles.outputLabel}>Simulate forged request (no token):</p>
            <button className="btn btn-red" onClick={runVulnerable} disabled={loadingVuln}>
              {loadingVuln ? 'Transferring...' : '⚠ Send forged request →'}
            </button>
            {vulnResult && (
              vulnResult.error
                ? <div className={styles.errorBox}>{vulnResult.error}</div>
                : <div className={styles.errorBox}>{vulnResult.message}</div>
            )}
          </div>
        </div>

        {/* Secure */}
        <div className={`${styles.panel} ${styles.panelSafe}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span className={styles.panelTitle}>Secure</span>
              <span className="badge badge-green">CSRF token required</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/csrf-secure/route.ts</div>
            <pre className={styles.code}>{`// ✅ SECURE
if (!validTokens.has(csrfToken)) {
  return 403 Forbidden;
}
// One-time token — invalidated after use
validTokens.delete(csrfToken);
transferFunds(from, to, amount);`}</pre>
          </div>

          <div className={styles.outputArea}>
            <p className={styles.outputLabel}>Current CSRF token (from server):</p>
            <code style={{ fontSize: 11, color: 'var(--green)', wordBreak: 'break-all', display: 'block', marginBottom: 12 }}>{csrfToken || 'loading...'}</code>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={runSecure} disabled={loadingSafe}>
                {loadingSafe ? '...' : 'Forged (no token)'}
              </button>
              <button className="btn btn-green" onClick={runSecureWithToken} disabled={loadingSafe || !csrfToken}>
                {loadingSafe ? '...' : 'Legit (with token) →'}
              </button>
            </div>
            {safeResult && (
              safeResult.blocked
                ? <div className={styles.blockedBox}>🛡 Blocked: {safeResult.error}</div>
                : safeResult.error
                ? <div className={styles.errorBox}>{safeResult.error}</div>
                : <div className={styles.successBox}>{safeResult.message}</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <h3 className={styles.explainTitle}>How CSRF works</h3>
        <div className={styles.explainGrid}>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>1</div>
            <div>
              <div className={styles.stepTitle}>User is logged in</div>
              <div className={styles.stepDesc}>Alice is authenticated at bank.com. Her session cookie is stored in the browser.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>2</div>
            <div>
              <div className={styles.stepTitle}>Attacker page loads</div>
              <div className={styles.stepDesc}>Alice visits evil.com which silently sends a POST to bank.com/transfer. The browser attaches Alice's cookie automatically.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>3</div>
            <div>
              <div className={styles.stepTitle}>Transfer completes</div>
              <div className={styles.stepDesc}>The vulnerable server sees a valid authenticated request and processes it. Alice never clicked anything on bank.com.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum} style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green-mid)' }}>✓</div>
            <div>
              <div className={styles.stepTitle}>Fix: CSRF tokens</div>
              <div className={styles.stepDesc}>Include a secret per-session token in every form. Forged requests from other origins won't have it — the server rejects them.</div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
