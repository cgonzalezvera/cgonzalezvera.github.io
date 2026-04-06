# ⚽ FIFA World Cup 2026 – Fixture App

A lightweight SPA (Single-Page Application) built with **Vue 3 + TypeScript + Vite** to browse the complete FIFA World Cup 2026 fixture schedule.

🔗 **Live site:** [cgonzalezvera.github.io](https://cgonzalezvera.github.io)

---

## Features

| Feature | Description |
|---|---|
| 📅 Today's Matches | Home page shows all matches scheduled for today (Argentina time) |
| 🔍 Country Search | Autocomplete search to find all matches for any participating country |
| 📋 Full Schedule | Browse all 104 matches by stage (Fase de Grupos A–L, Dieciseisavos, Octavos, Cuartos, Semifinal, Final) |
| ⏰ Timezone Display | **Argentina (ART)** as primary time, ET as secondary |
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
| `npm run data:extract` | Regenerate `src/data/fixtures.json` from the CSV source |

---

## Data Source (Single Source of Truth)

All match data comes from a single CSV file:

```
data/fixture_mundial_2026-v2.csv
```

### CSV Columns

| Column | Description |
|---|---|
| `Nro_Partido` | Match number (1–104) |
| `Fase` | Stage: `Fase de Grupos`, `Dieciseisavos`, `Octavos`, `Cuartos`, `Semifinal`, `Tercer Puesto`, `Final` |
| `Grupo` | Group letter (A–L) for group stage; `-` for knockout rounds |
| `Ciudad` | Host city |
| `Fecha` | Date in DD/MM/YYYY format (year 2026 for all matches) |
| `Hora_ET` | Match time in Eastern Time (ET, UTC-4) |
| `Hora_ARG` | Match time in Argentina Time (ART, UTC-3). A trailing `*` indicates midnight crossing (match falls on next calendar day in Argentina) |
| `Equipo_1` | Team 1: real code (e.g. `MEX`) in group stage, or placeholder in knockouts (e.g. `1°A`, `Gan. P73`, `Per. P101`) |
| `Equipo_2` | Team 2: same as above |

### Timezone Logic

- Argentina (ART) = UTC-3 (no daylight saving)
- Eastern Time (EDT) = UTC-4 during the June–July tournament
- ART = ET + 1 hour
- When ART midnight crossing occurs, `Hora_ARG` is stored as `00:00*` and `dateARG` is advanced by one day

### Regenerating Fixture Data

```bash
npm run data:extract
```

This runs `scripts/extract-data.js` which:
1. Reads `data/fixture_mundial_2026-v2.csv` as the **single source of truth**
2. Resolves real team codes to full team objects (name, flag, confederation)
3. Stores knockout-stage placeholders verbatim (e.g. `1°A`, `Gan. P73`)
4. Handles `00:00*` midnight crossings by advancing `dateARG` by one day
5. Validates: 72 group matches, 3 matches per real team
6. Writes output to `src/data/fixtures.json`

**To update any match data:** Edit `data/fixture_mundial_2026-v2.csv` and re-run `npm run data:extract`.

**To update team details (names, flags, confederations):** Edit the `teamDetails` object in `scripts/extract-data.js` and re-run the script.

### Team Search

The country/team search only surfaces **real teams** (48 group-stage participants). Knockout-stage placeholders like `1°A` or `Gan. P73` are excluded from the search, as they are not yet known teams.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build & deploy to Pages
├── data/
│   └── fixture_mundial_2026-v2.csv  # PRIMARY: complete fixture, all phases
├── scripts/
│   └── extract-data.js         # Data pipeline: CSV → fixtures.json
├── src/
│   ├── components/
│   │   ├── MatchCard.vue        # Individual match display component
│   │   └── TeamSearch.vue      # Country autocomplete search
│   ├── data/
│   │   └── fixtures.json       # 104-match FIFA 2026 dataset (generated)
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

---

## Data

The fixture data (`src/data/fixtures.json`) contains:

- **48 teams** across 12 groups (A–L)
- **72 group-stage matches** (June 11–26, 2026)
- **16 Round of 32 matches** / Dieciseisavos (June 27 – July 3)
- **8 Round of 16 matches** / Octavos (July 4–8)
- **4 Quarter-finals** / Cuartos (July 9–12)
- **2 Semi-finals** / Semifinal (July 14–15)
- **1 Third Place match** / Tercer Puesto (July 18)
- **1 Final** (July 19, New York/New Jersey)

**Hosts:** Mexico 🇲🇽 · USA 🇺🇸 · Canada 🇨🇦

---

## Tech Stack

- **[Vue 3](https://vuejs.org/)** – Composition API
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)** – Dev server & build tool
- **[Vue Router 4](https://router.vuejs.org/)** – Client-side routing
- **CSS Variables** – No UI framework, custom CSS only
