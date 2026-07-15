# 🔐 SecLab — Web Vulnerability Playground

A hands-on, interactive security lab built with **Next.js 14** that lets you attack and fix real vulnerabilities side-by-side.

![SecLab Screenshot](https://via.placeholder.com/1200x630/0a0c10/ff4757?text=SecLab+Security+Playground)

## 🚀 Live Demo

👉 **[seclab.vercel.app](https://seclab.vercel.app)** ← Deploy your own below

---

## 🧪 Labs Included

| Lab | Vulnerability | CWE | Severity |
|-----|--------------|-----|----------|
| [XSS](/xss) | Cross-Site Scripting | CWE-79 | HIGH |
| [SQLi](/sqli) | SQL Injection | CWE-89 | CRITICAL |
| [CSRF](/csrf) | Cross-Site Request Forgery | CWE-352 | MEDIUM |
| [IDOR](/idor) | Insecure Direct Object Reference | CWE-639 | HIGH |

Each lab features:
- ✅ **Live attack demos** — payloads that actually work
- ✅ **Side-by-side comparison** — vulnerable vs secure code
- ✅ **Inline code snippets** — see the exact fix
- ✅ **Real API routes** — not mocked, actual Next.js backend

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **better-sqlite3** (in-memory database)
- **CSS Modules** (no UI framework)
- Deployed on **Vercel**

---

## 💻 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/security-lab.git
cd security-lab
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deploy to Vercel

### Option 1 — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Option 2 — GitHub Integration

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import this repo
4. Click **Deploy** — no env vars needed!

> The app uses an **in-memory SQLite database** — no external database required.

---

## 📁 Project Structure

```
security-lab/
├── app/
│   ├── page.tsx              # Landing page
│   ├── xss/page.tsx          # XSS lab
│   ├── sqli/page.tsx         # SQL Injection lab
│   ├── csrf/page.tsx         # CSRF lab
│   ├── idor/page.tsx         # IDOR lab
│   └── api/
│       ├── xss-vulnerable/   # Raw innerHTML route
│       ├── xss-secure/       # Escaped output route
│       ├── sqli-vulnerable/  # String concat SQL route
│       ├── sqli-secure/      # Parameterized query route
│       ├── csrf-vulnerable/  # No token check route
│       ├── csrf-secure/      # Token validated route
│       ├── users-vulnerable/ # No auth check route
│       └── users-secure/     # Ownership check route
├── components/
│   └── LabShell.tsx          # Shared lab layout
└── lib/
    └── db.ts                 # In-memory SQLite setup
```

---

## ⚠️ Disclaimer

> This project is **intentionally vulnerable** for educational purposes only.
> All exploits are sandboxed within this demo UI. No real data is stored.
> The in-memory database resets on every server restart.
> **Do not use these patterns in production code.**

---

## 📚 Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) (free)
- [MITRE CWE](https://cwe.mitre.org)
- [HackTheBox](https://www.hackthebox.com)
- [TryHackMe](https://tryhackme.com)

---

## 🤝 Contributing

PRs welcome! Ideas for new labs:
- [ ] Command Injection (CWE-78)
- [ ] XXE (CWE-611)
- [ ] SSRF (CWE-918)
- [ ] Broken Authentication
- [ ] Path Traversal

---

## 📄 License

MIT — use freely for learning and teaching.
