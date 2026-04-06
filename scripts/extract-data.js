#!/usr/bin/env node
/**
 * FIFA 2026 World Cup – Data Extraction Script
 *
 * PRIMARY DATA SOURCE (single source of truth):
 *   data/fixture_mundial_2026-v2.csv
 *
 * Columns:
 *   Nro_Partido, Fase, Grupo, Ciudad, Fecha (DD/MM/YYYY),
 *   Hora_ET (HH:mm), Hora_ARG (HH:mm or HH:mm*), Equipo_1, Equipo_2
 *
 * Usage:
 *   npm run data:extract
 *
 * Output:
 *   src/data/fixtures.json
 *
 * Timezone rules:
 *   - Hora_ARG is the primary time (Argentina Time, UTC-3, no DST).
 *   - Hora_ET  is the secondary time (Eastern Time, UTC-4 during June–July).
 *   - Fecha column represents the Argentina calendar date for every match.
 *   - 00:00* in Hora_ARG means 00:00 of the SAME day shown in Fecha (no date shift).
 *     The asterisk is stripped; dateARG stays equal to the parsed Fecha.
 *
 * Team handling:
 *   - Group-stage teams use full Spanish names (e.g. "México", "Argentina").
 *   - Knockout-stage teams are placeholders (e.g. "1°A", "Gan. P74", "Mejor 3°(...)").
 *   - Only real (non-placeholder) teams appear in the search index.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================
// TEAM DATA
// Keyed by the exact Spanish name used in the CSV.
// ============================================================
const teamDetails = {
  // Group A
  "México":               { code: "MEX", flag: "🇲🇽", confederation: "CONCACAF", group: "A" },
  "Sudáfrica":            { code: "RSA", flag: "🇿🇦", confederation: "CAF",      group: "A" },
  "Corea del Sur":        { code: "KOR", flag: "🇰🇷", confederation: "AFC",      group: "A" },
  "Chequia":              { code: "CZE", flag: "🇨🇿", confederation: "UEFA",     group: "A" },
  // Group B
  "Canadá":               { code: "CAN", flag: "🇨🇦", confederation: "CONCACAF", group: "B" },
  "Bosnia y Herzegovina": { code: "BIH", flag: "🇧🇦", confederation: "UEFA",     group: "B" },
  "Qatar":                { code: "QAT", flag: "🇶🇦", confederation: "AFC",      group: "B" },
  "Suiza":                { code: "SUI", flag: "🇨🇭", confederation: "UEFA",     group: "B" },
  // Group C
  "Brasil":               { code: "BRA", flag: "🇧🇷", confederation: "CONMEBOL", group: "C" },
  "Marruecos":            { code: "MAR", flag: "🇲🇦", confederation: "CAF",      group: "C" },
  "Haití":                { code: "HAI", flag: "🇭🇹", confederation: "CONCACAF", group: "C" },
  "Escocia":              { code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA",     group: "C" },
  // Group D
  "Estados Unidos":       { code: "USA", flag: "🇺🇸", confederation: "CONCACAF", group: "D" },
  "Paraguay":             { code: "PAR", flag: "🇵🇾", confederation: "CONMEBOL", group: "D" },
  "Australia":            { code: "AUS", flag: "🇦🇺", confederation: "AFC",      group: "D" },
  "Turquía":              { code: "TUR", flag: "🇹🇷", confederation: "UEFA",     group: "D" },
  // Group E
  "Alemania":             { code: "GER", flag: "🇩🇪", confederation: "UEFA",     group: "E" },
  "Curazao":              { code: "CUW", flag: "🇨🇼", confederation: "CONCACAF", group: "E" },
  "Costa de Marfil":      { code: "CIV", flag: "🇨🇮", confederation: "CAF",      group: "E" },
  "Ecuador":              { code: "ECU", flag: "🇪🇨", confederation: "CONMEBOL", group: "E" },
  // Group F
  "Países Bajos":         { code: "NED", flag: "🇳🇱", confederation: "UEFA",     group: "F" },
  "Japón":                { code: "JPN", flag: "🇯🇵", confederation: "AFC",      group: "F" },
  "Suecia":               { code: "SWE", flag: "🇸🇪", confederation: "UEFA",     group: "F" },
  "Túnez":                { code: "TUN", flag: "🇹🇳", confederation: "CAF",      group: "F" },
  // Group G
  "Bélgica":              { code: "BEL", flag: "🇧🇪", confederation: "UEFA",     group: "G" },
  "Egipto":               { code: "EGY", flag: "🇪🇬", confederation: "CAF",      group: "G" },
  "Irán":                 { code: "IRN", flag: "🇮🇷", confederation: "AFC",      group: "G" },
  "Nueva Zelanda":        { code: "NZL", flag: "🇳🇿", confederation: "OFC",      group: "G" },
  // Group H
  "España":               { code: "ESP", flag: "🇪🇸", confederation: "UEFA",     group: "H" },
  "Cabo Verde":           { code: "CPV", flag: "🇨🇻", confederation: "CAF",      group: "H" },
  "Arabia Saudita":       { code: "KSA", flag: "🇸🇦", confederation: "AFC",      group: "H" },
  "Uruguay":              { code: "URU", flag: "🇺🇾", confederation: "CONMEBOL", group: "H" },
  // Group I
  "Francia":              { code: "FRA", flag: "🇫🇷", confederation: "UEFA",     group: "I" },
  "Senegal":              { code: "SEN", flag: "🇸🇳", confederation: "CAF",      group: "I" },
  "Irak":                 { code: "IRQ", flag: "🇮🇶", confederation: "AFC",      group: "I" },
  "Noruega":              { code: "NOR", flag: "🇳🇴", confederation: "UEFA",     group: "I" },
  // Group J
  "Argentina":            { code: "ARG", flag: "🇦🇷", confederation: "CONMEBOL", group: "J" },
  "Argelia":              { code: "ALG", flag: "🇩🇿", confederation: "CAF",      group: "J" },
  "Austria":              { code: "AUT", flag: "🇦🇹", confederation: "UEFA",     group: "J" },
  "Jordania":             { code: "JOR", flag: "🇯🇴", confederation: "AFC",      group: "J" },
  // Group K
  "Portugal":             { code: "POR", flag: "🇵🇹", confederation: "UEFA",     group: "K" },
  "Congo DR":             { code: "COD", flag: "🇨🇩", confederation: "CAF",      group: "K" },
  "Uzbekistán":           { code: "UZB", flag: "🇺🇿", confederation: "AFC",      group: "K" },
  "Colombia":             { code: "COL", flag: "🇨🇴", confederation: "CONMEBOL", group: "K" },
  // Group L
  "Inglaterra":           { code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA",     group: "L" },
  "Croacia":              { code: "CRO", flag: "🇭🇷", confederation: "UEFA",     group: "L" },
  "Ghana":                { code: "GHA", flag: "🇬🇭", confederation: "CAF",      group: "L" },
  "Panamá":               { code: "PAN", flag: "🇵🇦", confederation: "CONCACAF", group: "L" },
}

// ============================================================
// HELPERS
// ============================================================

/** Parse DD/MM/YYYY → ISO YYYY-MM-DD. */
function parseCsvDate(ddmmyyyy, rowNum) {
  if (!/^\d{1,2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) {
    throw new Error(`Row ${rowNum}: invalid date "${ddmmyyyy}" (expected DD/MM/YYYY)`)
  }
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

/**
 * Resolve a team from the CSV name.
 * Real teams: return full object from teamDetails (keyed by Spanish name).
 * Placeholders: return verbatim string as name/code.
 */
function resolveTeam(rawName) {
  const t = teamDetails[rawName]
  if (t) {
    return { name: rawName, code: t.code, flag: t.flag, confederation: t.confederation }
  }
  // Knockout placeholder (e.g. "1°A", "Gan. P74", "Mejor 3°(A/B/C/D/F)", "Per. P101")
  return { name: rawName, code: rawName, flag: '', confederation: '' }
}

/** Returns true for real teams (not placeholders). */
function isRealTeam(name) {
  return Boolean(teamDetails[name])
}

/**
 * Derive matchday (1, 2, or 3) for group-stage matches.
 *   Matchday 1: matches  1–24  (12 groups × 2 matches)
 *   Matchday 2: matches 25–48
 *   Matchday 3: matches 49–72
 */
function deriveMatchday(matchNumber) {
  if (matchNumber <= 24) return 1
  if (matchNumber <= 48) return 2
  return 3
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
    throw new Error(`CSV missing required column: "${col}". Found: ${csvHeader.join(', ')}`)
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

  // Fecha column = Argentina calendar date for every match.
  const dateARG = parseCsvDate(fechaRaw, i + 1)

  // Strip trailing '*' from Hora_ARG – no date shift (00:00* = 00:00 of the SAME day).
  const timeARG = horaARGRaw.replace(/\*$/, '')

  const matchday = fase === 'Fase de Grupos' ? deriveMatchday(matchNumber) : null

  matches.push({
    id: matchNumber,
    matchNumber,
    stage: fase,
    group: grupo === '-' ? null : grupo,
    matchday,
    date: dateARG,    // same as dateARG (Fecha is the ARG calendar date)
    dateARG,
    timeET: horaET,
    timeARG,
    city: ciudad,
    team1: resolveTeam(equipo1Raw),
    team2: resolveTeam(equipo2Raw),
  })
}

// ============================================================
// VALIDATION
// ============================================================

// Total matches
if (matches.length !== 104) {
  throw new Error(`Expected 104 matches, found ${matches.length}`)
}

// Group stage
const groupMatches = matches.filter(m => m.stage === 'Fase de Grupos')
if (groupMatches.length !== 72) {
  throw new Error(`Expected 72 group-stage matches, found ${groupMatches.length}`)
}

// Each real team: exactly 3 group-stage matches
const teamMatchCounts = {}
for (const m of groupMatches) {
  for (const t of [m.team1, m.team2]) {
    if (isRealTeam(t.name)) {
      teamMatchCounts[t.name] = (teamMatchCounts[t.name] ?? 0) + 1
    }
  }
}
for (const [name, count] of Object.entries(teamMatchCounts)) {
  if (count !== 3) {
    throw new Error(`"${name}" should have 3 group matches, found ${count}`)
  }
}

// ============================================================
// OUTPUT
// ============================================================

// All real teams (search index – placeholders excluded)
const allTeams = Object.entries(teamDetails).map(([name, t]) => ({
  name,
  code: t.code,
  flag: t.flag,
  confederation: t.confederation,
  group: t.group,
}))

const output = {
  metadata: {
    tournament: "FIFA World Cup 2026",
    edition: 23,
    hostCountries: ["México", "Estados Unidos", "Canadá"],
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

const stageCounts = {}
for (const m of matches) {
  stageCounts[m.stage] = (stageCounts[m.stage] ?? 0) + 1
}

console.log(`✅ Generated ${matches.length} matches from data/fixture_mundial_2026-v2.csv`)
for (const [stage, count] of Object.entries(stageCounts)) {
  console.log(`   ${stage}: ${count}`)
}
console.log(`   Real teams: ${allTeams.length}`)
console.log(`📁 Output: ${outPath}`)
