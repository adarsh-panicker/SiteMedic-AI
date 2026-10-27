# SiteMedic AI — Autonomous Website Audit & Repair Agent

> **Built for the Nebius × NVIDIA Global AI Hackathon (Best Apps & Agents Track)**  
> Powered by **NVIDIA Nemotron** via **Nebius Token Factory** (`https://api.tokenfactory.nebius.com/v1/`)

![SiteMedic AI Banner](public/banner.png) <!-- Conceptual Header -->

SiteMedic AI is an intelligent website doctor and autonomous repair agent. Rather than merely listing defects or functioning as an AI chatbot wrapper, SiteMedic AI:
1. **Audits real websites and source files** with an evidence-backed deterministic engine (Accessibility, SEO, Broken Links, HTML structure, CSS contrast).
2. **Diagnoses root causes** using **NVIDIA Nemotron** via Nebius Token Factory.
3. **Generates minimal, non-destructive code patches**.
4. **Validates fixes in an automated loop** (HTML validation, rule re-audits, and bounded revisions).
5. **Provides side-by-side Diff and Preview controls** in the **AI Repair Lab**, with one-click patch or corrected file export.

---

## 🌟 Hackathon Track & Requirements Checklist

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Track** | Best Apps and Agents Track | ✅ |
| **AI Cloud Platform** | Nebius Token Factory (`https://api.tokenfactory.nebius.com/v1/`) | ✅ |
| **AI Model** | `nvidia/Nemotron-3.5-Super` (with `nvidia/Nemotron-3-Lightning` fallback) | ✅ |
| **Authentication** | HTTP Bearer Token (`NEBIUS_API_KEY`) server-side via Next.js API routes | ✅ |
| **No API Key Required for Demo** | Sample "Acme Corp" site with actual defective files runs out-of-the-box | ✅ |
| **Security Protections** | SSRF prevention (private IPs, link-local, cloud metadata blocked), ZIP path traversal protection | ✅ |
| **Agentic Workflow** | 7-stage loop: Inspect → Diagnose → Plan → Patch → Validate → Revise → Report | ✅ |
| **Automated Verification** | 28 automated tests covering scoring, scanner rules, SSRF, ZIP security, and diffs | ✅ |

---

## 🏗️ Architecture & Agentic Workflow

```
┌────────────────────────────────────────────────────────┐
│                   SiteMedic AI UI                      │
│   (Dashboard · New Scan · Repair Lab · Reports)        │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    Live Website (SSRF safe)    ZIP Archive (Traversal safe)
             │                           │
             └─────────────┬─────────────┘
                           ▼
          Deterministic Scanner Engine (Cheerio)
          - WCAG 2.1 A11Y Rules (Alt text, inputs, lang, links)
          - SEO Engine (Titles, descriptions, headings, OG)
          - Link integrity & asset existence
          - Health score algorithm [0 - 100]
                           │
                           ▼
          Bounded AI Repair Agent Workflow
  ┌──────────────────────────────────────────────────┐
  │ 1. Inspect  : Extract evidence & context snippets│
  │ 2. Diagnose : Explain root cause & impact        │
  │ 3. Plan     : Minimal patch strategy             │
  │ 4. Patch    : NVIDIA Nemotron via Nebius API     │
  │ 5. Validate : Structural HTML check & rule rerun │
  │ 6. Revise   : Re-prompt if validation fails      │
  │ 7. Report   : Diff generation & patch export     │
  └──────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/sitemedic-ai.git
cd sitemedic-ai
npm install
```

### 2. Configure Environment (Optional for Demo Mode)
The application works immediately in **Demo Mode** without any API keys.  
To enable AI-powered repairs with **NVIDIA Nemotron**:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEBIUS_API_KEY=your_actual_nebius_token_here
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
NEBIUS_MODEL=nvidia/Nemotron-3.5-Super
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```
All 28 tests will execute, validating URL security, scanner rules, scoring, ZIP extraction, and diff computation.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Reproducible Sample Website (`demo/`)

The repository includes a documented sample website in `demo/`:
- `demo/sample-site/`: Contains real HTML and CSS files with intentional defects:
  - `A11Y-001`: Images missing `alt` attributes in `index.html`
  - `SEO-010`: Missing `<meta name="description">`
  - `A11Y-010`: Missing `lang` attribute on `<html>`
  - `LINK-001`: Broken internal reference to `mission-statement.html`
  - `CSS-001`: White text on white background in `styles.css`
- `demo/clean-reference/`: Fully compliant benchmark version for comparison.
- `public/sample-site.zip`: Downloadable ZIP archive to test the upload scan pipeline.

Click **"Try Demo"** on the landing page or `/scan` to immediately trigger a zero-config scan on this sample website.

---

## 🎬 3-Minute Hackathon Demo Script

| Timestamp | Screen / Action | Narration & Key Points |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Landing Page (`/`) | *"Welcome to SiteMedic AI, an autonomous website audit and repair agent built for the Nebius × NVIDIA Hackathon. Most tools just list errors. SiteMedic AI diagnoses them, generates minimal code fixes with NVIDIA Nemotron, and validates the fixes before you apply them."* |
| **0:25 - 0:55** | Demo Scan (`/scan?demo=true`) | *"Clicking 'Try Demo' runs our deterministic scanner on a sample site without needing API keys. We find 11 real issues categorized by severity with a calculated Health Score of 67. Notice the evidence collected for missing alt text and missing SEO metadata."* |
| **0:55 - 1:35** | Repair Lab (`/repair-lab`) | *"Open an issue in the AI Repair Lab. With our Nebius API key configured, we trigger NVIDIA Nemotron-3.5-Super. The model receives only relevant context, analyzes the root cause, and generates a minimal patch."* |
| **1:35 - 2:15** | Agentic Validation Loop | *"SiteMedic AI executes our bounded workflow: Inspect → Diagnose → Plan → Patch → Validate. It validates the HTML and re-audits the patched code. If a test fails, the agent automatically revises up to 2 times."* |
| **2:15 - 3:00** | Diff & Export | *"We review the unified diff side-by-side, inspect the verification plan and risks, and export the corrected file or unified patch with one click. SiteMedic AI turns hours of manual debugging into verified, instant repairs."* |

---

## 🛡️ Security Protections

- **Server-Side Request Forgery (SSRF) Prevention:** Blocks all private/reserved IPv4 & IPv6 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`), cloud metadata services (`169.254.169.254`), and restricted ports (SSH, database, mail).
- **ZIP Bomb & Path Traversal Prevention:** Enforces 50MB archive limits, 200MB decompressed limits, 500 file limits, and rejects relative paths (`../`, `\`, `/`).
- **Zero Host Execution:** Uploaded files and scraped websites are analyzed strictly as passive text data in memory; no user scripts are ever executed on the host server.
- **Credential Protection:** `NEBIUS_API_KEY` is exclusively consumed in server-side API routes (`/api/repair`) and never leaked to the client bundle.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
