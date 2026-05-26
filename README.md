# SWS Financial Solutions — Advisory Portal

A unified suite of intelligent financial planning tools built for Indian investors and financial advisors.

## Tech Stack

- **Build Tool**: Vite 5 (Multi-Page Application)
- **Frontend**: HTML5, Vanilla JS, CSS3
- **Package Manager**: npm

## Modules

| # | Module | Route | Status |
|---|--------|-------|--------|
| 1 | **Goal-Based Financial Planner** | `/goal-planner/` | Live |
| 2 | **Client Risk Profiling Engine** | `/risk-profiling/` | Live |
| 3 | **Emergency Fund Adequacy Analyzer** | `/emergency-fund/` | Planned |

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to view the portal. Vite serves all pages from a single dev server.

| Page | URL |
|------|-----|
| Portal Home | `http://localhost:5173/` |
| Goal Planner | `http://localhost:5173/goal-planner/` |
| Risk Profiling | `http://localhost:5173/risk-profiling/` |

## Build

```bash
npm run build
```

Outputs optimized static files to `dist/` with hashed assets and proper entry points for each page.

## Architecture

```
sws-project-1/
├── package.json                  # Single dependency manifest
├── vite.config.js               # MPA build configuration
├── index.html                    # Landing page (/) entry
├── goal-planner/
│   └── index.html               # Module 1 entry
├── risk-profiling/
│   └── index.html               # Module 2 entry
├── src/
│   ├── pages/
│   │   ├── home/
│   │   │   ├── main.js          # Home page JS
│   │   │   └── styles.css       # Home page styles
│   │   ├── goal-planner/
│   │   │   ├── main.js          # Goal planner logic
│   │   │   └── styles.css       # Goal planner styles
│   │   └── risk-profiling/
│   │       ├── main.js          # Risk profiling logic
│   │       └── styles.css       # Risk profiling styles
│   ├── shared/
│   │   ├── styles/
│   │   │   └── base.css         # Shared CSS variables, reset, utilities
│   │   └── utils/
│   │       └── index.js         # Shared helpers (escapeHtml, showToast, fmtINR)
│   └── assets/
│       └── (images, fonts, etc.)
├── public/
│   └── (static files copied as-is)
└── README.md
```

## Shared Design System

All pages import `src/shared/styles/base.css` for a consistent SWS brand:
- **Background**: `#f8fafc` (light gray)
- **Primary**: `#0066cc` (SWS blue)
- **Accent**: `#dc2626` (SWS red)
- **Cards**: White, 16px radius, subtle shadow
- **Typography**: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`

## Deployment

### Static Hosting
Deploy the `dist/` folder to any static host (Netlify, Vercel, S3, Cloudflare Pages, etc.).

Ensure your host supports SPA/MPA fallback rules for clean URLs:
- `/` → `index.html`
- `/goal-planner/` → `goal-planner/index.html`
- `/risk-profiling/` → `risk-profiling/index.html`

### Backend (Module 3)
When the Emergency Fund module backend is ready, deploy the `backend/` folder to any Node.js host (Railway, Render, VPS, etc.). Ensure PostgreSQL is accessible and environment variables are set.

## License

Proprietary — SWS Financial Solutions
