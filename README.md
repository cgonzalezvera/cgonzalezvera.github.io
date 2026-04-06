# ⚽ FIFA World Cup 2026 – Fixture App

A lightweight SPA (Single-Page Application) built with **Vue 3 + TypeScript + Vite** to browse the complete FIFA World Cup 2026 fixture schedule.

🔗 **Live site:** [cgonzalezvera.github.io](https://cgonzalezvera.github.io)

---

## Features

| Feature | Description |
|---|---|
| 📅 Today's Matches | Home page shows all matches scheduled for today |
| 🔍 Country Search | Autocomplete search to find all matches for any participating country |
| 📋 Full Schedule | Browse all 104 matches by stage (Group A–L, R32, R16, QF, SF, Final) |
| ⏰ Timezone Display | All times shown in **ET (Eastern Time)** + local time conversion |
| 📱 Responsive | Works on desktop and mobile |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run data:extract` | Regenerate `src/data/fixtures.json` from the schedule script |

---

## Regenerating Fixture Data

The fixture data lives in `src/data/fixtures.json`. To regenerate it:

```bash
npm run data:extract
```

This runs `scripts/extract-data.js` which:
1. Defines all 48 teams and their group assignments
2. Generates the full schedule (group stage + knockout rounds) with dates, times, and venues
3. Writes the output to `src/data/fixtures.json`

**To update teams or groups:** Edit the `groups` object in `scripts/extract-data.js` and re-run the script.

### Timezone Note

All match times are stored and displayed in **ET (Eastern Time, UTC-4 / EDT** during the June–July tournament window). The app also shows local time by converting from ET using the browser's local timezone.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build & deploy to Pages
├── scripts/
│   └── extract-data.js         # Data generation script
├── src/
│   ├── components/
│   │   ├── MatchCard.vue        # Individual match display component
│   │   └── TeamSearch.vue      # Country autocomplete search
│   ├── data/
│   │   └── fixtures.json       # 104-match FIFA 2026 dataset
│   ├── router/
│   │   └── index.ts            # Vue Router (hash history for GitHub Pages)
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Match, Team, FixturesData)
│   ├── views/
│   │   ├── HomeView.vue         # Home page: today's matches + schedule
│   │   └── TeamView.vue         # Country matches page
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## GitHub Pages Deployment

The site is automatically deployed to GitHub Pages on every push to `main` via the included workflow (`.github/workflows/deploy.yml`).

**Manual setup (one time):**
1. Go to your repo → **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` – the workflow builds and deploys automatically

The app uses **hash-based routing** (`createWebHashHistory`) so all routes work correctly on GitHub Pages without needing a custom 404 page.

### Vite Configuration

`vite.config.ts` sets `base: '/'` since this is a GitHub user/org page (`cgonzalezvera.github.io`). If deploying to a project page (e.g., `username.github.io/repo-name`), update `base` to `'/repo-name/'`.

---

## Data

The fixture data (`src/data/fixtures.json`) contains:

- **48 teams** across 12 groups (A–L)
- **72 group stage matches** (June 11–26, 2026)
- **16 Round of 32 matches** (June 27 – July 3)
- **8 Round of 16 matches** (July 4–8)
- **4 Quarter-finals** (July 9–12)
- **2 Semi-finals** (July 14–15)
- **1 Third Place match** (July 18)
- **1 Final** (July 19, MetLife Stadium, New York/New Jersey)

**Hosts:** Mexico 🇲🇽 · USA 🇺🇸 · Canada 🇨🇦 (16 venues)

> **Note:** Group assignments and some schedule details are based on publicly available FIFA 2026 information. To update with official confirmed data, edit `scripts/extract-data.js` and run `npm run data:extract`.

---

## Tech Stack

- **[Vue 3](https://vuejs.org/)** – Composition API
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)** – Dev server & build tool
- **[Vue Router 4](https://router.vuejs.org/)** – Client-side routing
- **CSS Variables** – No UI framework, custom CSS only
