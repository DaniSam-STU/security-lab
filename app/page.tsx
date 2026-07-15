'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const LABS = [
  {
    id: 'xss',
    title: 'Cross-Site Scripting',
    short: 'XSS',
    href: '/xss',
    severity: 'HIGH',
    cve: 'CWE-79',
    desc: 'Inject malicious scripts into web pages viewed by other users. Steal cookies, hijack sessions, redirect users.',
    color: 'red',
    payloads: ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<svg onload=alert(1)>'],
  },
  {
    id: 'sqli',
    title: 'SQL Injection',
    short: 'SQLi',
    href: '/sqli',
    severity: 'CRITICAL',
    cve: 'CWE-89',
    desc: 'Manipulate SQL queries to bypass authentication, dump entire databases, or delete records.',
    color: 'red',
    payloads: ["' OR '1'='1", "' OR 1=1--", "' UNION SELECT * FROM users--"],
  },
  {
    id: 'csrf',
    title: 'Cross-Site Request Forgery',
    short: 'CSRF',
    href: '/csrf',
    severity: 'MEDIUM',
    cve: 'CWE-352',
    desc: 'Trick authenticated users into unknowingly submitting malicious requests to a trusted application.',
    color: 'amber',
    payloads: ['<form action="/api/transfer">', 'Hidden auto-submit forms', 'Image tag GET requests'],
  },
  {
    id: 'idor',
    title: 'Insecure Direct Object Reference',
    short: 'IDOR',
    href: '/idor',
    severity: 'HIGH',
    cve: 'CWE-639',
    desc: 'Access other users\' data by manipulating object references in URLs or API parameters.',
    color: 'amber',
    payloads: ['/api/users/1 → /api/users/2', 'Change order_id in request', 'Enumerate sequential IDs'],
  },
];

const TERMINAL_LINES = [
  { text: '$ nmap -sV target.com', delay: 0 },
  { text: 'Starting Nmap 7.94...', delay: 400 },
  { text: 'PORT   STATE  SERVICE', delay: 800 },
  { text: '80/tcp open   http nginx', delay: 1100 },
  { text: '443/tcp open  https', delay: 1300 },
  { text: '', delay: 1600 },
  { text: '$ sqlmap -u "target.com/login" --dbs', delay: 1800 },
  { text: '[*] testing connection...', delay: 2200 },
  { text: '[*] heuristic (basic) test shows that GET parameter is dynamic', delay: 2600 },
  { text: '[!] heuristic (XSS) test shows reflective injection...', delay: 3000 },
  { text: '[CRITICAL] parameter appears to be injectable!', delay: 3500 },
];

export default function HomePage() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(prev => [...prev, i]), line.delay);
    });
  }, []);

  return (
    <div className={styles.page}>
      <div className="noise" />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span>SecLab</span>
          </div>
          <div className={styles.navLinks}>
            <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener" className={styles.navLink}>OWASP Top 10</a>
            <a href="https://github.com" target="_blank" rel="noopener" className={styles.navLink}>GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Educational Security Lab
          </div>
          <h1 className={styles.heroTitle}>
            Break it.<br />
            <span className={styles.heroAccent}>Understand it.</span><br />
            Fix it.
          </h1>
          <p className={styles.heroDesc}>
            Hands-on demos of the most critical web vulnerabilities.
            Each lab shows the attack working in real time — then shows you exactly how to stop it.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/xss" className="btn btn-red">
              Start with XSS →
            </Link>
            <Link href="/sqli" className="btn btn-outline">
              Jump to SQLi
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>4</span><span className={styles.statLabel}>Vulnerabilities</span></div>
            <div className={styles.statDiv} />
            <div className={styles.stat}><span className={styles.statNum}>8</span><span className={styles.statLabel}>Attack demos</span></div>
            <div className={styles.statDiv} />
            <div className={styles.stat}><span className={styles.statNum}>100%</span><span className={styles.statLabel}>Sandboxed</span></div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.terminal}>
            <div className={styles.terminalHeader}>
              <span className={styles.dot} style={{ background: '#ff5f57' }} />
              <span className={styles.dot} style={{ background: '#ffbd2e' }} />
              <span className={styles.dot} style={{ background: '#28c840' }} />
              <span className={styles.terminalTitle}>terminal — bash</span>
            </div>
            <div className={styles.terminalBody}>
              {TERMINAL_LINES.map((line, i) => (
                visibleLines.includes(i) && (
                  <div key={i} className={`${styles.termLine} ${line.text.includes('CRITICAL') ? styles.termCritical : line.text.includes('[!]') ? styles.termWarn : line.text.startsWith('$') ? styles.termCmd : styles.termOut} animate-in`}>
                    {line.text || '\u00a0'}
                  </div>
                )
              ))}
              {visibleLines.length === TERMINAL_LINES.length && (
                <div className={`${styles.termLine} ${styles.termCmd} cursor`}>$</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3.5a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 018 4.5zm1 7.25a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor"/>
        </svg>
        <strong>For educational use only.</strong> All exploits run in an isolated sandbox. No real data is stored. Do not use these techniques on systems you don't own.
      </div>

      {/* Labs grid */}
      <section className={styles.labs}>
        <div className={styles.labsHeader}>
          <h2 className={styles.labsTitle}>Vulnerability Labs</h2>
          <p className={styles.labsSubtitle}>Each lab has a vulnerable demo, attack payloads, and a secure version with the fix.</p>
        </div>
        <div className={styles.labsGrid}>
          {LABS.map(lab => (
            <Link key={lab.id} href={lab.href} className={`${styles.labCard} ${lab.color === 'red' ? styles.labCardRed : styles.labCardAmber}`}>
              <div className={styles.labCardTop}>
                <div className={styles.labCardLeft}>
                  <span className={`badge ${lab.severity === 'CRITICAL' ? 'badge-red' : lab.severity === 'HIGH' ? 'badge-red' : 'badge-amber'}`}>
                    {lab.severity}
                  </span>
                  <span className={styles.labCve}>{lab.cve}</span>
                </div>
                <span className={styles.labShort}>{lab.short}</span>
              </div>
              <h3 className={styles.labCardTitle}>{lab.title}</h3>
              <p className={styles.labCardDesc}>{lab.desc}</p>
              <div className={styles.labPayloads}>
                {lab.payloads.map(p => (
                  <code key={p} className={styles.labPayload}>{p}</code>
                ))}
              </div>
              <div className={styles.labCardCta}>
                Open lab <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Built for learning. All vulnerabilities are intentional and sandboxed.</p>
        <p className={styles.footerLinks}>
          <a href="https://owasp.org" target="_blank" rel="noopener">OWASP</a>
          <span>·</span>
          <a href="https://portswigger.net/web-security" target="_blank" rel="noopener">PortSwigger Academy</a>
          <span>·</span>
          <a href="https://cwe.mitre.org" target="_blank" rel="noopener">MITRE CWE</a>
        </p>
      </footer>
    </div>
  );
}
