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
1. Reads `data/fixture-mundial-2026-fase-grupos.csv` as the **primary source** for all group-stage match details (date, time, venue, city, matchday)
2. Combines CSV data with the team/group definitions in `scripts/extract-data.js`
3. Appends the knockout-round schedule (teams TBD)
4. Validates: 72 group matches, 4 teams per group, 3 matches per team
5. Writes the output to `src/data/fixtures.json`

### Data Sources

| Source | What it provides |
|---|---|
| `data/fixture-mundial-2026-fase-grupos.csv` | **Primary** – all 72 group-stage matches: date (DD/MM), time (ET), venue, city, home/away team codes |
| `scripts/extract-data.js` → `groups` object | Team details (full name, flag, confederation) and group assignments |
| `scripts/extract-data.js` → knockout schedules | Round of 32 through Final (dates, venues; teams TBD) |

**To correct group-stage matches:** Edit `data/fixture-mundial-2026-fase-grupos.csv` and re-run `npm run data:extract`.

**To update teams or groups:** Edit the `groups` object in `scripts/extract-data.js` and re-run the script.

### Timezone Note

All match times in the CSV and in the output JSON are in **ET (Eastern Time, UTC-4 / EDT** during the June–July tournament window). The app also shows the user's local time by converting from ET using the browser's local timezone.

### Venue Normalisation

The script automatically corrects known venue-name typos (e.g. "BC Place Vanvouver" → "BC Place") via the `venueNormalisations` map in `scripts/extract-data.js`. Add new entries there if the CSV contains variant spellings.

---

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build & deploy to Pages
├── data/
│   └── fixture-mundial-2026-fase-grupos.csv  # PRIMARY: group-stage schedule
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

### Vite Configuration

`vite.config.ts` sets `base: '/'` since this is a GitHub user/org page (`cgonzalezvera.github.io`). If deploying to a project page (e.g., `username.github.io/repo-name`), update `base` to `'/repo-name/'`.

---

## Data

The fixture data (`src/data/fixtures.json`) contains:

- **48 teams** across 12 groups (A–L)
- **72 group stage matches** (June 11–26, 2026) — sourced from `data/fixture-mundial-2026-fase-grupos.csv`
- **16 Round of 32 matches** (June 27 – July 3)
- **8 Round of 16 matches** (July 4–8)
- **4 Quarter-finals** (July 9–12)
- **2 Semi-finals** (July 14–15)
- **1 Third Place match** (July 18)
- **1 Final** (July 19, MetLife Stadium, New York/New Jersey)

**Hosts:** Mexico 🇲🇽 · USA 🇺🇸 · Canada 🇨🇦 (16 venues)

> **Updating data:** Group-stage schedule → edit `data/fixture-mundial-2026-fase-grupos.csv`.
> Team/group assignments → edit the `groups` object in `scripts/extract-data.js`.
> Then run `npm run data:extract` to regenerate `src/data/fixtures.json`.

---

## Tech Stack

- **[Vue 3](https://vuejs.org/)** – Composition API
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vite.dev/)** – Dev server & build tool
- **[Vue Router 4](https://router.vuejs.org/)** – Client-side routing
- **CSS Variables** – No UI framework, custom CSS only
