#!/usr/bin/env node
/**
 * FIFA 2026 World Cup - Data Extraction Script
 *
 * PRIMARY DATA SOURCE (single source of truth):
 *   data/fixture_mundial_2026-v2.csv
 *
 * Columns:
 *   Nro_Partido, Fase, Grupo, Ciudad, Fecha (DD/MM/YYYY),
 *   Hora_ET, Hora_ARG, Equipo_1, Equipo_2
 *
 * Usage:
 *   npm run data:extract
 *
 * Output:
 *   src/data/fixtures.json
 *
 * Notes:
 *   - All times in the CSV are stored as-is (ET and ARG).
 *   - Hora_ARG values ending in '*' indicate a midnight crossing:
 *     the match occurs at 00:00 of the NEXT day in Argentina.
 *     In that case dateARG is advanced by one day.
 *   - Team fields (Equipo_1, Equipo_2) can be real team codes (e.g. "MEX")
 *     or knockout-stage placeholders (e.g. "1 grado A", "Gan. P73", "Per. P101").
 *   - For real teams (group stage), full team details (name, flag, etc.)
 *     are resolved from the teamDetails map below.
 *   - For placeholder teams the fields are stored verbatim.
 *   - Team search in the UI uses only real teams (no placeholders).
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================
// TEAM DATA
// Full details for every real team in the tournament.
// Keyed by the 3-letter code used in the group-stage CSV rows.
// ============================================================
const teamDetails = {
  MEX: { name: "Mexico",         code: "MEX", confederation: "CONCACAF", flag: "🇲🇽", group: "A" },
  POL: { name: "Poland",         code: "POL", confederation: "UEFA",     flag: "🇵🇱", group: "A" },
  KOR: { name: "South Korea",    code: "KOR", confederation: "AFC",      flag: "🇰🇷", group: "A" },
  CIV: { name: "Ivory Coast",    code: "CIV", confederation: "CAF",      flag: "🇨🇮", group: "A" },
  USA: { name: "USA",            code: "USA", confederation: "CONCACAF", flag: "🇺🇸", group: "B" },
  SUI: { name: "Switzerland",    code: "SUI", confederation: "UEFA",     flag: "🇨🇭", group: "B" },
  JPN: { name: "Japan",          code: "JPN", confederation: "AFC",      flag: "🇯🇵", group: "B" },
  EGY: { name: "Egypt",          code: "EGY", confederation: "CAF",      flag: "🇪🇬", group: "B" },
  CAN: { name: "Canada",         code: "CAN", confederation: "CONCACAF", flag: "🇨🇦", group: "C" },
  CRO: { name: "Croatia",        code: "CRO", confederation: "UEFA",     flag: "🇭🇷", group: "C" },
  AUS: { name: "Australia",      code: "AUS", confederation: "AFC",      flag: "🇦🇺", group: "C" },
  SEN: { name: "Senegal",        code: "SEN", confederation: "CAF",      flag: "🇸🇳", group: "C" },
  ARG: { name: "Argentina",      code: "ARG", confederation: "CONMEBOL", flag: "🇦🇷", group: "D" },
  DEN: { name: "Denmark",        code: "DEN", confederation: "UEFA",     flag: "🇩🇰", group: "D" },
  IRN: { name: "Iran",           code: "IRN", confederation: "AFC",      flag: "🇮🇷", group: "D" },
  NGA: { name: "Nigeria",        code: "NGA", confederation: "CAF",      flag: "🇳🇬", group: "D" },
  BRA: { name: "Brazil",         code: "BRA", confederation: "CONMEBOL", flag: "🇧🇷", group: "E" },
  AUT: { name: "Austria",        code: "AUT", confederation: "UEFA",     flag: "🇦🇹", group: "E" },
  KSA: { name: "Saudi Arabia",   code: "KSA", confederation: "AFC",      flag: "🇸🇦", group: "E" },
  RSA: { name: "South Africa",   code: "RSA", confederation: "CAF",      flag: "🇿🇦", group: "E" },
  ESP: { name: "Spain",          code: "ESP", confederation: "UEFA",     flag: "🇪🇸", group: "F" },
  PAR: { name: "Paraguay",       code: "PAR", confederation: "CONMEBOL", flag: "🇵🇾", group: "F" },
  QAT: { name: "Qatar",          code: "QAT", confederation: "AFC",      flag: "🇶🇦", group: "F" },
  CMR: { name: "Cameroon",       code: "CMR", confederation: "CAF",      flag: "🇨🇲", group: "F" },
  FRA: { name: "France",         code: "FRA", confederation: "UEFA",     flag: "🇫🇷", group: "G" },
  ECU: { name: "Ecuador",        code: "ECU", confederation: "CONMEBOL", flag: "🇪🇨", group: "G" },
  IRQ: { name: "Iraq",           code: "IRQ", confederation: "AFC",      flag: "🇮🇶", group: "G" },
  ALG: { name: "Algeria",        code: "ALG", confederation: "CAF",      flag: "🇩🇿", group: "G" },
  GER: { name: "Germany",        code: "GER", confederation: "UEFA",     flag: "��🇪", group: "H" },
  COL: { name: "Colombia",       code: "COL", confederation: "CONMEBOL", flag: "🇨🇴", group: "H" },
  JOR: { name: "Jordan",         code: "JOR", confederation: "AFC",      flag: "🇯🇴", group: "H" },
  TUN: { name: "Tunisia",        code: "TUN", confederation: "CAF",      flag: "🇹🇳", group: "H" },
  ENG: { name: "England",        code: "ENG", confederation: "UEFA",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "I" },
  SCO: { name: "Scotland",       code: "SCO", confederation: "UEFA",     flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "I" },
  PAN: { name: "Panama",         code: "PAN", confederation: "CONCACAF", flag: "🇵🇦", group: "I" },
  URU: { name: "Uruguay",        code: "URU", confederation: "CONMEBOL", flag: "🇺🇾", group: "I" },
  NED: { name: "Netherlands",    code: "NED", confederation: "UEFA",     flag: "🇳🇱", group: "J" },
  CZE: { name: "Czech Republic", code: "CZE", confederation: "UEFA",     flag: "🇨🇿", group: "J" },
  HON: { name: "Honduras",       code: "HON", confederation: "CONCACAF", flag: "🇭🇳", group: "J" },
  MAR: { name: "Morocco",        code: "MAR", confederation: "CAF",      flag: "🇲🇦", group: "J" },
  BEL: { name: "Belgium",        code: "BEL", confederation: "UEFA",     flag: "🇧🇪", group: "K" },
  SRB: { name: "Serbia",         code: "SRB", confederation: "UEFA",     flag: "🇷🇸", group: "K" },
  CRC: { name: "Costa Rica",     code: "CRC", confederation: "CONCACAF", flag: "🇨🇷", group: "K" },
  NZL: { name: "New Zealand",    code: "NZL", confederation: "OFC",      flag: "🇳🇿", group: "K" },
  POR: { name: "Portugal",       code: "POR", confederation: "UEFA",     flag: "🇵🇹", group: "L" },
  ITA: { name: "Italy",          code: "ITA", confederation: "UEFA",     flag: "🇮🇹", group: "L" },
  IDN: { name: "Indonesia",      code: "IDN", confederation: "AFC",      flag: "🇮🇩", group: "L" },
  VEN: { name: "Venezuela",      code: "VEN", confederation: "CONMEBOL", flag: "🇻🇪", group: "L" },
}

// ============================================================
// HELPERS
// ============================================================

/** Parse a DD/MM/YYYY date string into an ISO date string (YYYY-MM-DD). */
function parseCsvDate(ddmmyyyy, rowNum) {
  if (!/^\d{1,2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) {
    throw new Error(`Row ${rowNum}: invalid date format "${ddmmyyyy}" (expected DD/MM/YYYY)`)
  }
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

/** Add one day to an ISO date string (YYYY-MM-DD). */
function addOneDay(isoDate) {
  const d = new Date(isoDate + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Resolve a team entry from the CSV.
 * - If the code exists in teamDetails -> return full Team object.
 * - Otherwise -> treat as placeholder string.
 */
function resolveTeam(rawCode) {
  const t = teamDetails[rawCode]
  if (t) {
    return { name: t.name, code: t.code, flag: t.flag, confederation: t.confederation }
  }
  // Placeholder (e.g. "1 grado A", "Gan. P73", "Per. P101")
  return { name: rawCode, code: rawCode, flag: '', confederation: '' }
}

/** Returns true if the team code is a real team (not a placeholder). */
function isRealTeam(code) {
  return Boolean(teamDetails[code])
}

// ============================================================
// CSV PARSING
// ============================================================
const REQUIRED_COLUMNS = [
  'Nro_Partido', 'Fase', 'Grupo', 'Ciudad',
  'Fecha', 'Hora_ET', 'Hora_ARG', 'Equipo_1', 'Equipo_2'
]

const csvPath = join(__dirname, '../data/fixture_mundial_2026-v2.csv')
const csvText = readFileSync(csvPath, 'utf-8')
const csvLines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
const csvHeader = csvLines[0].split(',').map(h => h.trim())

const COL = {}
csvHeader.forEach((h, i) => { COL[h] = i })

for (const col of REQUIRED_COLUMNS) {
  if (COL[col] === undefined) {
    throw new Error(`CSV is missing required column: "${col}". Found: ${csvHeader.join(', ')}`)
  }
}

const matches = []

for (let i = 1; i < csvLines.length; i++) {
  const cols = csvLines[i].split(',')
  if (cols.length < csvHeader.length) continue

  const matchNumber = parseInt(cols[COL['Nro_Partido']].trim(), 10)
  const fase        = cols[COL['Fase']].trim()
  const grupo       = cols[COL['Grupo']].trim()
  const ciudad      = cols[COL['Ciudad']].trim()
  const fechaRaw    = cols[COL['Fecha']].trim()
  const horaET      = cols[COL['Hora_ET']].trim()
  const horaARGRaw  = cols[COL['Hora_ARG']].trim()
  const equipo1Raw  = cols[COL['Equipo_1']].trim()
  const equipo2Raw  = cols[COL['Equipo_2']].trim()

  const dateET = parseCsvDate(fechaRaw, i + 1)

  // Handle midnight crossing: Hora_ARG ending in '*' means 00:00 of the next day in Argentina.
  const midnightCrossing = horaARGRaw.endsWith('*')
  const horaARG = midnightCrossing ? horaARGRaw.slice(0, -1) : horaARGRaw
  const dateARG = midnightCrossing ? addOneDay(dateET) : dateET

  // Derive matchday for group stage
  const matchday = fase === 'Fase de Grupos' ? deriveMatchday(matchNumber) : null

  matches.push({
    id: matchNumber,
    matchNumber,
    stage: fase,
    group: grupo === '-' ? null : grupo,
    matchday,
    date: dateET,
    dateARG,
    timeET: horaET,
    timeARG: horaARG,
    city: ciudad,
    team1: resolveTeam(equipo1Raw),
    team2: resolveTeam(equipo2Raw),
  })
}

/**
 * Derive matchday (1, 2, or 3) for group-stage matches.
 *  - Matchday 1: matches 1-24  (all 12 groups x 2 matches each)
 *  - Matchday 2: matches 25-48
 *  - Matchday 3: matches 49-72
 */
function deriveMatchday(matchNumber) {
  if (matchNumber <= 24) return 1
  if (matchNumber <= 48) return 2
  return 3
}

// ============================================================
// VALIDATION (group stage)
// ============================================================
const groupMatches = matches.filter(m => m.stage === 'Fase de Grupos')

if (groupMatches.length !== 72) {
  throw new Error(`Expected 72 group-stage matches, found ${groupMatches.length}`)
}

// Each real team should have exactly 3 group-stage matches
const teamMatchCounts = {}
for (const m of groupMatches) {
  for (const t of [m.team1, m.team2]) {
    if (isRealTeam(t.code)) {
      teamMatchCounts[t.code] = (teamMatchCounts[t.code] ?? 0) + 1
    }
  }
}
for (const [code, count] of Object.entries(teamMatchCounts)) {
  if (count !== 3) {
    throw new Error(`${code} should have 3 group matches, found ${count}`)
  }
}

// ============================================================
// OUTPUT
// ============================================================

// All real teams (used by team search - placeholders are excluded)
const allTeams = Object.values(teamDetails).map(t => ({
  name: t.name,
  code: t.code,
  flag: t.flag,
  confederation: t.confederation,
  group: t.group,
}))

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
    primaryTimezone: "ART (Argentina Time, UTC-3)",
    secondaryTimezone: "ET (Eastern Time, UTC-4 during tournament)",
    dataSource: "data/fixture_mundial_2026-v2.csv (single source of truth for all phases)",
    lastUpdated: new Date().toISOString().slice(0, 10)
  },
  teams: allTeams,
  matches
}

const outPath = join(__dirname, '../src/data/fixtures.json')
writeFileSync(outPath, JSON.stringify(output, null, 2))

console.log(`✅ Generated ${matches.length} matches from data/fixture_mundial_2026-v2.csv`)
console.log(`   Fase de Grupos:  ${matches.filter(m => m.stage === 'Fase de Grupos').length} matches`)
console.log(`   Dieciseisavos:   ${matches.filter(m => m.stage === 'Dieciseisavos').length} matches`)
console.log(`   Octavos:         ${matches.filter(m => m.stage === 'Octavos').length} matches`)
console.log(`   Cuartos:         ${matches.filter(m => m.stage === 'Cuartos').length} matches`)
console.log(`   Semifinal:       ${matches.filter(m => m.stage === 'Semifinal').length} matches`)
console.log(`   Tercer Puesto:   ${matches.filter(m => m.stage === 'Tercer Puesto').length} match`)
console.log(`   Final:           ${matches.filter(m => m.stage === 'Final').length} match`)
console.log(`   Real teams:      ${allTeams.length}`)
console.log(`📁 Output: ${outPath}`)
