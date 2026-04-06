# ⚽ FIFA World Cup 2026 – Fixture App

A lightweight SPA (Single-Page Application) built with **Vue 3 + TypeScript + Vite** to browse the complete FIFA World Cup 2026 fixture schedule.

🔗 **Live site:** [cgonzalezvera.github.io](https://cgonzalezvera.github.io)

---

## Features

| Feature | Description |
|---|---|
| 📅 Partidos del día | Home page shows all matches scheduled for today (Argentina time) |
| 🔍 Buscar por país | Autocomplete search to find all matches for any participating country |
| 📋 Fixture completo | Browse all 104 matches by stage (Fase de Grupos A–L, Dieciseisavos, Octavos, Cuartos, Semifinal, Final) |
| ⏰ Horario | **Argentina (ART)** as primary time, ET as secondary |
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
| `Fase` | Stage: `Fase de Grupos`, `Dieciseisavos de Final`, `Octavos de Final`, `Cuartos de Final`, `Semifinal`, `Tercer Puesto`, `Final` |
| `Grupo` | Group letter (A–L) for group stage; `-` for knockout rounds |
| `Ciudad` | Host city |
| `Fecha` | Date in DD/MM/YYYY format (year 2026 for all matches) – **this is the Argentina calendar date** |
| `Hora_ET` | Match time in Eastern Time (ET, UTC-4) |
| `Hora_ARG` | Match time in Argentina Time (ART, UTC-3). A trailing `*` (e.g. `00:00*`) means 00:00 of the **same day** shown in `Fecha` – the `*` is just stripped, no date shift occurs. |
| `Equipo_1` | Team 1: full Spanish name (e.g. `México`, `Argentina`) in group stage, or placeholder in knockouts (e.g. `1°A`, `Gan. P74`, `Per. P101`) |
| `Equipo_2` | Team 2: same as above |

### Timezone Logic

- Argentina (ART) = UTC-3 (no daylight saving)
- Eastern Time (EDT) = UTC-4 during the June–July tournament
- `Hora_ARG` is the **primary** time displayed in the UI; `Hora_ET` is the secondary.
- The `Fecha` column represents the **Argentina calendar date** for every match.
- `00:00*` in `Hora_ARG`: strip the `*` and use 00:00 of the **same day** indicated by `Fecha`. No date shift.
  - Example: `26/06/2026` + `00:00*` → `dateARG = 2026-06-26`, `timeARG = 00:00`
- Home "Partidos del día" compares against today's date in `America/Argentina/Buenos_Aires` (UTC-3).

### Regenerating Fixture Data

```bash
npm run data:extract
```

This runs `scripts/extract-data.js` which:
1. Reads `data/fixture_mundial_2026-v2.csv` as the **single source of truth**
2. Resolves real Spanish team names to full team objects (code, flag, confederation)
3. Stores knockout-stage placeholders verbatim (e.g. `1°A`, `Gan. P74`)
4. Handles `00:00*` by stripping the `*` — **no date adjustment**
5. Validates: 104 total matches, 72 group matches, 3 matches per real team
6. Writes output to `src/data/fixtures.json`

**To update any match data:** Edit `data/fixture_mundial_2026-v2.csv` and re-run `npm run data:extract`.

**To update team details (flags, confederations):** Edit the `teamDetails` object in `scripts/extract-data.js` and re-run the script.

### Team Search

The country/team search only surfaces **real teams** (the 48 group-stage participants identified by their Spanish names). Knockout-stage placeholders like `1°A`, `Gan. P73`, `Mejor 3°(...)` are excluded from the search.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions: build & deploy to Pages
├── data/
│   └── fixture_mundial_2026-v2.csv      # PRIMARY: complete fixture, all phases (104 matches)
├── scripts/
│   └── extract-data.js                  # Data pipeline: CSV → fixtures.json
├── src/
│   ├── components/
│   │   ├── MatchCard.vue                # Individual match display component
│   │   └── TeamSearch.vue              # Country autocomplete search
│   ├── data/
│   │   └── fixtures.json               # 104-match FIFA 2026 dataset (generated)
│   ├── router/
│   │   └── index.ts                    # Vue Router (hash history for GitHub Pages)
│   ├── types/
│   │   └── index.ts                    # TypeScript interfaces (Match, Team, FixturesData)
│   ├── views/
│   │   ├── HomeView.vue                # Home page: today's matches + schedule
│   │   └── TeamView.vue                # Country matches page
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

## Data Summary

The fixture data (`src/data/fixtures.json`) contains:

- **48 teams** across 12 groups (A–L)
- **72 group-stage matches** (June 11–27, 2026)
- **16 Round of 32 / Dieciseisavos de Final** (June 28 – July 3)
- **8 Round of 16 / Octavos de Final** (July 4–7)
- **4 Quarter-finals / Cuartos de Final** (July 9–11)
- **2 Semi-finals / Semifinal** (July 14–15)
- **1 Third Place match / Tercer Puesto** (July 18)
- **1 Final** (July 19, Nueva York/Nueva Jersey)

**Hosts:** México 🇲🇽 · Estados Unidos 🇺🇸 · Canadá 🇨🇦

---

## Tech Stack

- **[Vue 3](https://vuejs.org/)** – Composition API
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)** – Dev server & build tool
- **[Vue Router 4](https://router.vuejs.org/)** – Client-side routing
- **CSS Variables** – No UI framework, custom CSS only
