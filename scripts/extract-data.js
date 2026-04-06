#!/usr/bin/env node
/**
 * FIFA 2026 World Cup - Data Extraction Script
 *
 * PRIMARY DATA SOURCE:
 *   data/fixture-mundial-2026-fase-grupos.csv  (group stage schedule)
 *
 * This script reads the group-stage schedule from the CSV and combines it with
 * the team/group definitions below to produce src/data/fixtures.json consumed
 * by the Vue app.  Knockout-stage matches are defined inline (teams TBD).
 *
 * Usage:
 *   npm run data:extract
 *
 * Output:
 *   src/data/fixtures.json
 *
 * To correct group-stage data: edit the CSV and re-run this script.
 * To correct team/group assignments: edit the `groups` object below.
 *
 * Notes:
 *   - All match times are in ET (Eastern Time, UTC-4 during tournament)
 *   - CSV dates are DD/MM; the script assumes year 2026
 *   - Venue names are normalised on read (e.g. typos corrected)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================
// TEAM DATA
// Modify this section if group assignments need to be updated.
// ============================================================
const groups = {
  A: {
    teams: [
      { name: "Mexico", code: "MEX", confederation: "CONCACAF", flag: "🇲🇽" },
      { name: "Poland", code: "POL", confederation: "UEFA", flag: "🇵🇱" },
      { name: "South Korea", code: "KOR", confederation: "AFC", flag: "🇰🇷" },
      { name: "Ivory Coast", code: "CIV", confederation: "CAF", flag: "🇨🇮" }
    ]
  },
  B: {
    teams: [
      { name: "USA", code: "USA", confederation: "CONCACAF", flag: "🇺🇸" },
      { name: "Switzerland", code: "SUI", confederation: "UEFA", flag: "🇨🇭" },
      { name: "Japan", code: "JPN", confederation: "AFC", flag: "🇯🇵" },
      { name: "Egypt", code: "EGY", confederation: "CAF", flag: "🇪🇬" }
    ]
  },
  C: {
    teams: [
      { name: "Canada", code: "CAN", confederation: "CONCACAF", flag: "🇨🇦" },
      { name: "Croatia", code: "CRO", confederation: "UEFA", flag: "🇭🇷" },
      { name: "Australia", code: "AUS", confederation: "AFC", flag: "🇦🇺" },
      { name: "Senegal", code: "SEN", confederation: "CAF", flag: "🇸🇳" }
    ]
  },
  D: {
    teams: [
      { name: "Argentina", code: "ARG", confederation: "CONMEBOL", flag: "🇦🇷" },
      { name: "Denmark", code: "DEN", confederation: "UEFA", flag: "🇩🇰" },
      { name: "Iran", code: "IRN", confederation: "AFC", flag: "🇮🇷" },
      { name: "Nigeria", code: "NGA", confederation: "CAF", flag: "🇳🇬" }
    ]
  },
  E: {
    teams: [
      { name: "Brazil", code: "BRA", confederation: "CONMEBOL", flag: "🇧🇷" },
      { name: "Austria", code: "AUT", confederation: "UEFA", flag: "🇦🇹" },
      { name: "Saudi Arabia", code: "KSA", confederation: "AFC", flag: "🇸🇦" },
      { name: "South Africa", code: "RSA", confederation: "CAF", flag: "🇿🇦" }
    ]
  },
  F: {
    teams: [
      { name: "Spain", code: "ESP", confederation: "UEFA", flag: "🇪🇸" },
      { name: "Paraguay", code: "PAR", confederation: "CONMEBOL", flag: "🇵🇾" },
      { name: "Qatar", code: "QAT", confederation: "AFC", flag: "🇶🇦" },
      { name: "Cameroon", code: "CMR", confederation: "CAF", flag: "🇨🇲" }
    ]
  },
  G: {
    teams: [
      { name: "France", code: "FRA", confederation: "UEFA", flag: "🇫🇷" },
      { name: "Ecuador", code: "ECU", confederation: "CONMEBOL", flag: "🇪🇨" },
      { name: "Iraq", code: "IRQ", confederation: "AFC", flag: "🇮🇶" },
      { name: "Algeria", code: "ALG", confederation: "CAF", flag: "🇩🇿" }
    ]
  },
  H: {
    teams: [
      { name: "Germany", code: "GER", confederation: "UEFA", flag: "🇩🇪" },
      { name: "Colombia", code: "COL", confederation: "CONMEBOL", flag: "🇨🇴" },
      { name: "Jordan", code: "JOR", confederation: "AFC", flag: "🇯🇴" },
      { name: "Tunisia", code: "TUN", confederation: "CAF", flag: "🇹🇳" }
    ]
  },
  I: {
    teams: [
      { name: "England", code: "ENG", confederation: "UEFA", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { name: "Scotland", code: "SCO", confederation: "UEFA", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      { name: "Panama", code: "PAN", confederation: "CONCACAF", flag: "🇵🇦" },
      { name: "Uruguay", code: "URU", confederation: "CONMEBOL", flag: "🇺🇾" }
    ]
  },
  J: {
    teams: [
      { name: "Netherlands", code: "NED", confederation: "UEFA", flag: "🇳🇱" },
      { name: "Czech Republic", code: "CZE", confederation: "UEFA", flag: "🇨🇿" },
      { name: "Honduras", code: "HON", confederation: "CONCACAF", flag: "🇭🇳" },
      { name: "Morocco", code: "MAR", confederation: "CAF", flag: "🇲🇦" }
    ]
  },
  K: {
    teams: [
      { name: "Belgium", code: "BEL", confederation: "UEFA", flag: "🇧🇪" },
      { name: "Serbia", code: "SRB", confederation: "UEFA", flag: "🇷🇸" },
      { name: "Costa Rica", code: "CRC", confederation: "CONCACAF", flag: "🇨🇷" },
      { name: "New Zealand", code: "NZL", confederation: "OFC", flag: "🇳🇿" }
    ]
  },
  L: {
    teams: [
      { name: "Portugal", code: "POR", confederation: "UEFA", flag: "🇵🇹" },
      { name: "Italy", code: "ITA", confederation: "UEFA", flag: "🇮🇹" },
      { name: "Indonesia", code: "IDN", confederation: "AFC", flag: "🇮🇩" },
      { name: "Venezuela", code: "VEN", confederation: "CONMEBOL", flag: "🇻🇪" }
    ]
  }
}

// ============================================================
// VENUE NAME NORMALISATIONS
// Keys are the raw strings that may appear in the CSV; values are
// the canonical [venue, city, country] tuples used in the output.
// Add entries here whenever a typo or variation needs to be mapped.
// ============================================================
const venueNormalisations = {
  // Typo variants → canonical
  "BC Place Vanvouver": ["BC Place", "Vancouver", "Canada"],
  "BC Place Vancouver":  ["BC Place", "Vancouver", "Canada"],
  // Country variants
  "Mercedes Benz Stadium":   ["Mercedes-Benz Stadium", "Atlanta",              "USA"],
  "Levis Stadium":           ["Levi's Stadium",        "San Francisco Bay Area","USA"],
  "Levi Stadium":            ["Levi's Stadium",        "San Francisco Bay Area","USA"],
}

/** Normalise a venue/city pair from the CSV into {venue, city, country}.
 *  Checks by venue name alone first, then by combined "venue city" string.
 *  NOTE: The CSV parser uses a simple comma-split, so venue/city fields
 *  must not contain literal commas (all current values are safe). */
function normaliseVenue(rawVenue, rawCity, rawCountry) {
  if (venueNormalisations[rawVenue]) {
    const [v, c, co] = venueNormalisations[rawVenue]
    return { venue: v, city: c, country: co }
  }
  const combined = `${rawVenue} ${rawCity}`.trim()
  if (venueNormalisations[combined]) {
    const [v, c, co] = venueNormalisations[combined]
    return { venue: v, city: c, country: co }
  }
  return { venue: rawVenue.trim(), city: rawCity.trim(), country: rawCountry.trim() }
}

// ============================================================
// BUILD A FLAT TEAM MAP  code → team object
// ============================================================
const teamByCode = {}
for (const [group, { teams }] of Object.entries(groups)) {
  for (const t of teams) {
    teamByCode[t.code] = { ...t, group }
  }
}

// ============================================================
// CSV PARSING – GROUP STAGE
// Primary source: data/fixture-mundial-2026-fase-grupos.csv
// Columns: Grupo,Fecha calendario,Hora,Estadio,Ciudad,Pais sede,Local,Visitante,Jornada
// ============================================================

/** Parse a DD/MM date string into an ISO date string (YYYY-MM-DD, year 2026).
 *  Throws if the format is not exactly DD/MM. */
function parseCsvDate(ddmm, rowNum) {
  if (!/^\d{1,2}\/\d{2}$/.test(ddmm)) {
    throw new Error(`Row ${rowNum}: invalid date format "${ddmm}" (expected DD/MM)`)
  }
  const [dd, mm] = ddmm.split('/')
  return `2026-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`
}

const REQUIRED_COLUMNS = ['Grupo', 'Fecha calendario', 'Hora', 'Estadio', 'Ciudad', 'Pais sede', 'Local', 'Visitante', 'Jornada']

const csvPath = join(__dirname, '../data/fixture-mundial-2026-fase-grupos.csv')
const csvText = readFileSync(csvPath, 'utf-8')
const csvLines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
const csvHeader = csvLines[0].split(',').map(h => h.trim())

const COL = {}
csvHeader.forEach((h, i) => { COL[h] = i })

// Validate that all required columns are present
for (const col of REQUIRED_COLUMNS) {
  if (COL[col] === undefined) {
    throw new Error(`CSV is missing required column: "${col}". Found: ${csvHeader.join(', ')}`)
  }
}

let matches = []
let id = 1

for (let i = 1; i < csvLines.length; i++) {
  const cols = csvLines[i].split(',')
  if (cols.length < csvHeader.length) continue  // skip incomplete rows

  const group      = cols[COL['Grupo']].trim()
  const dateStr    = cols[COL['Fecha calendario']].trim()
  const time       = cols[COL['Hora']].trim()
  const rawVenue   = cols[COL['Estadio']].trim()
  const rawCity    = cols[COL['Ciudad']].trim()
  const rawCountry = cols[COL['Pais sede']].trim()
  const localCode  = cols[COL['Local']].trim()
  const awayCode   = cols[COL['Visitante']].trim()
  const matchday   = parseInt(cols[COL['Jornada']].trim(), 10)

  const ht = teamByCode[localCode]
  const at = teamByCode[awayCode]
  if (!ht) throw new Error(`Unknown team code in CSV row ${i + 1}: "${localCode}"`)
  if (!at) throw new Error(`Unknown team code in CSV row ${i + 1}: "${awayCode}"`)

  const { venue, city, country } = normaliseVenue(rawVenue, rawCity, rawCountry)

  matches.push({
    id: id++,
    stage: `Group ${group}`,
    group,
    matchday,
    date: parseCsvDate(dateStr, i + 1),
    time,
    timezone: "ET",
    city,
    venue,
    country,
    homeTeam: { name: ht.name, code: ht.code, flag: ht.flag, confederation: ht.confederation },
    awayTeam: { name: at.name, code: at.code, flag: at.flag, confederation: at.confederation }
  })
}

// ============================================================
// VALIDATION
// ============================================================
const groupMatches = matches.filter(m => m.group)

if (groupMatches.length !== 72) {
  throw new Error(`Expected 72 group-stage matches, found ${groupMatches.length}`)
}

for (const [g, { teams }] of Object.entries(groups)) {
  if (teams.length !== 4) {
    throw new Error(`Group ${g} must have exactly 4 teams, found ${teams.length}`)
  }
  for (const t of teams) {
    const played = groupMatches.filter(
      m => m.homeTeam.code === t.code || m.awayTeam.code === t.code
    )
    if (played.length !== 3) {
      throw new Error(`${t.name} (${t.code}) must have 3 group matches, found ${played.length}`)
    }
  }
}

// ============================================================
// KNOCKOUT ROUNDS  (teams TBD – defined inline)
// ============================================================

const venues = [
  ["Mexico City",            "Estadio Azteca",          "Mexico"],
  ["Guadalajara",            "Estadio Akron",            "Mexico"],
  ["Monterrey",              "Estadio BBVA",             "Mexico"],
  ["New York/New Jersey",    "MetLife Stadium",          "USA"],
  ["Los Angeles",            "SoFi Stadium",             "USA"],
  ["Dallas",                 "AT&T Stadium",             "USA"],
  ["San Francisco Bay Area", "Levi's Stadium",           "USA"],
  ["Miami",                  "Hard Rock Stadium",        "USA"],
  ["Atlanta",                "Mercedes-Benz Stadium",    "USA"],
  ["Seattle",                "Lumen Field",              "USA"],
  ["Boston",                 "Gillette Stadium",         "USA"],
  ["Philadelphia",           "Lincoln Financial Field",  "USA"],
  ["Kansas City",            "Arrowhead Stadium",        "USA"],
  ["Houston",                "NRG Stadium",              "USA"],
  ["Toronto",                "BMO Field",                "Canada"],
  ["Vancouver",              "BC Place",                 "Canada"]
]

// Round of 32
const r32Schedule = [
  { home: "Winner Group A", away: "3rd Place (B/C/D)", date: "2026-06-27", time: "18:00", venueIdx: 3 },
  { home: "Runner-up Group C", away: "Runner-up Group D", date: "2026-06-27", time: "21:00", venueIdx: 7 },
  { home: "Winner Group C", away: "3rd Place (A/B/F)", date: "2026-06-28", time: "15:00", venueIdx: 4 },
  { home: "Runner-up Group A", away: "Runner-up Group B", date: "2026-06-28", time: "18:00", venueIdx: 0 },
  { home: "Winner Group D", away: "3rd Place (E/F/G)", date: "2026-06-28", time: "21:00", venueIdx: 8 },
  { home: "Runner-up Group E", away: "Runner-up Group F", date: "2026-06-29", time: "15:00", venueIdx: 5 },
  { home: "Winner Group B", away: "3rd Place (H/I/J)", date: "2026-06-29", time: "18:00", venueIdx: 9 },
  { home: "Runner-up Group G", away: "Runner-up Group H", date: "2026-06-29", time: "21:00", venueIdx: 6 },
  { home: "Winner Group E", away: "3rd Place (K/L/A)", date: "2026-06-30", time: "15:00", venueIdx: 11 },
  { home: "Runner-up Group I", away: "Runner-up Group J", date: "2026-06-30", time: "18:00", venueIdx: 14 },
  { home: "Winner Group F", away: "3rd Place (B/C/E)", date: "2026-07-01", time: "15:00", venueIdx: 12 },
  { home: "Runner-up Group K", away: "Runner-up Group L", date: "2026-07-01", time: "18:00", venueIdx: 15 },
  { home: "Winner Group G", away: "3rd Place (D/E/H)", date: "2026-07-02", time: "15:00", venueIdx: 1 },
  { home: "Winner Group H", away: "3rd Place (I/J/K)", date: "2026-07-02", time: "18:00", venueIdx: 13 },
  { home: "Winner Group I", away: "Winner Group J", date: "2026-07-02", time: "21:00", venueIdx: 3 },
  { home: "Winner Group K", away: "Winner Group L", date: "2026-07-03", time: "18:00", venueIdx: 4 }
]

for (const m of r32Schedule) {
  const [city, venue, country] = venues[m.venueIdx]
  matches.push({
    id: id++, stage: "Round of 32", group: null, matchday: null,
    date: m.date, time: m.time, timezone: "ET",
    city, venue, country,
    homeTeam: { name: m.home, code: "TBD", flag: "🏳️", confederation: "TBD" },
    awayTeam: { name: m.away, code: "TBD", flag: "🏳️", confederation: "TBD" }
  })
}

// Round of 16
const r16Schedule = [
  { home: "Winner R32-1", away: "Winner R32-2", date: "2026-07-04", time: "15:00", venueIdx: 3 },
  { home: "Winner R32-3", away: "Winner R32-4", date: "2026-07-04", time: "21:00", venueIdx: 8 },
  { home: "Winner R32-5", away: "Winner R32-6", date: "2026-07-05", time: "15:00", venueIdx: 0 },
  { home: "Winner R32-7", away: "Winner R32-8", date: "2026-07-05", time: "21:00", venueIdx: 4 },
  { home: "Winner R32-9", away: "Winner R32-10", date: "2026-07-06", time: "15:00", venueIdx: 5 },
  { home: "Winner R32-11", away: "Winner R32-12", date: "2026-07-06", time: "21:00", venueIdx: 7 },
  { home: "Winner R32-13", away: "Winner R32-14", date: "2026-07-07", time: "15:00", venueIdx: 9 },
  { home: "Winner R32-15", away: "Winner R32-16", date: "2026-07-08", time: "18:00", venueIdx: 3 }
]

for (const m of r16Schedule) {
  const [city, venue, country] = venues[m.venueIdx]
  matches.push({
    id: id++, stage: "Round of 16", group: null, matchday: null,
    date: m.date, time: m.time, timezone: "ET",
    city, venue, country,
    homeTeam: { name: m.home, code: "TBD", flag: "🏳️", confederation: "TBD" },
    awayTeam: { name: m.away, code: "TBD", flag: "🏳️", confederation: "TBD" }
  })
}

// Quarter-finals
const qfSchedule = [
  { home: "Winner R16-1", away: "Winner R16-2", date: "2026-07-09", time: "15:00", venueIdx: 3 },
  { home: "Winner R16-3", away: "Winner R16-4", date: "2026-07-09", time: "21:00", venueIdx: 4 },
  { home: "Winner R16-5", away: "Winner R16-6", date: "2026-07-11", time: "15:00", venueIdx: 5 },
  { home: "Winner R16-7", away: "Winner R16-8", date: "2026-07-12", time: "21:00", venueIdx: 8 }
]

for (const m of qfSchedule) {
  const [city, venue, country] = venues[m.venueIdx]
  matches.push({
    id: id++, stage: "Quarter-final", group: null, matchday: null,
    date: m.date, time: m.time, timezone: "ET",
    city, venue, country,
    homeTeam: { name: m.home, code: "TBD", flag: "🏳️", confederation: "TBD" },
    awayTeam: { name: m.away, code: "TBD", flag: "🏳️", confederation: "TBD" }
  })
}

// Semi-finals
const sfSchedule = [
  { home: "Winner QF-1", away: "Winner QF-2", date: "2026-07-14", time: "18:00", venueIdx: 3 },
  { home: "Winner QF-3", away: "Winner QF-4", date: "2026-07-15", time: "18:00", venueIdx: 4 }
]

for (const m of sfSchedule) {
  const [city, venue, country] = venues[m.venueIdx]
  matches.push({
    id: id++, stage: "Semi-final", group: null, matchday: null,
    date: m.date, time: m.time, timezone: "ET",
    city, venue, country,
    homeTeam: { name: m.home, code: "TBD", flag: "🏳️", confederation: "TBD" },
    awayTeam: { name: m.away, code: "TBD", flag: "🏳️", confederation: "TBD" }
  })
}

// Third place
matches.push({
  id: id++, stage: "Third Place", group: null, matchday: null,
  date: "2026-07-18", time: "15:00", timezone: "ET",
  city: venues[4][0], venue: venues[4][1], country: venues[4][2],
  homeTeam: { name: "Loser SF-1", code: "TBD", flag: "🏳️", confederation: "TBD" },
  awayTeam: { name: "Loser SF-2", code: "TBD", flag: "🏳️", confederation: "TBD" }
})

// Final
matches.push({
  id: id++, stage: "Final", group: null, matchday: null,
  date: "2026-07-19", time: "18:00", timezone: "ET",
  city: venues[3][0], venue: venues[3][1], country: venues[3][2],
  homeTeam: { name: "Winner SF-1", code: "TBD", flag: "🏳️", confederation: "TBD" },
  awayTeam: { name: "Winner SF-2", code: "TBD", flag: "🏳️", confederation: "TBD" }
})

// All teams
const allTeams = Object.values(groups).flatMap(g => g.teams)

const output = {
  metadata: {
    tournament: "FIFA World Cup 2026",
    edition: 23,
    hostCountries: ["Mexico", "USA", "Canada"],
    openingMatch: "2026-06-11",
    final: "2026-07-19",
    totalTeams: 48,
    totalGroups: 12,
    totalMatches: matches.length,
    timezone: "ET (Eastern Time, UTC-4 during tournament in June-July)",
    dataSource: "Group-stage schedule: data/fixture-mundial-2026-fase-grupos.csv (primary source). Group/team assignments: scripts/extract-data.js groups object. Based on official FIFA 2026 World Cup draw (December 5, 2024).",
    lastUpdated: new Date().toISOString().slice(0, 10)
  },
  teams: allTeams,
  matches
}

const outPath = join(__dirname, '../src/data/fixtures.json')
writeFileSync(outPath, JSON.stringify(output, null, 2))

console.log(`✅ Generated ${matches.length} matches`)
console.log(`   Group stage:  ${matches.filter(m => m.stage.startsWith('Group')).length} matches`)
console.log(`   Round of 32:  ${matches.filter(m => m.stage === 'Round of 32').length} matches`)
console.log(`   Round of 16:  ${matches.filter(m => m.stage === 'Round of 16').length} matches`)
console.log(`   Quarter-final: ${matches.filter(m => m.stage === 'Quarter-final').length} matches`)
console.log(`   Semi-final:   ${matches.filter(m => m.stage === 'Semi-final').length} matches`)
console.log(`   Third Place:  ${matches.filter(m => m.stage === 'Third Place').length} match`)
console.log(`   Final:        ${matches.filter(m => m.stage === 'Final').length} match`)
console.log(`   Teams:        ${allTeams.length}`)
console.log(`📁 Output: ${outPath}`)
