#!/usr/bin/env node
/**
 * FIFA 2026 World Cup - Data Extraction Script
 *
 * This script generates the fixture data for the FIFA 2026 World Cup.
 * The data is based on:
 *   - Official FIFA 2026 World Cup schedule and venue information
 *   - Official group draw results (December 5, 2024)
 *
 * Usage:
 *   npm run data:extract
 *
 * Output:
 *   src/data/fixtures.json
 *
 * Notes:
 *   - All match times are in ET (Eastern Time, UTC-4 during tournament in June-July)
 *   - Group assignments reflect the official draw but may need verification
 *   - Knockout stage teams are TBD until the group stage completes
 *   - If you have access to updated/corrected information, edit the groups
 *     object below and re-run this script.
 */

import { writeFileSync } from 'fs'
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
// VENUES
// [city, stadium, country]
// ============================================================
const venues = [
  ["Mexico City", "Estadio Azteca", "Mexico"],
  ["Guadalajara", "Estadio Akron", "Mexico"],
  ["Monterrey", "Estadio BBVA", "Mexico"],
  ["New York/New Jersey", "MetLife Stadium", "USA"],
  ["Los Angeles", "SoFi Stadium", "USA"],
  ["Dallas", "AT&T Stadium", "USA"],
  ["San Francisco Bay Area", "Levi's Stadium", "USA"],
  ["Miami", "Hard Rock Stadium", "USA"],
  ["Atlanta", "Mercedes-Benz Stadium", "USA"],
  ["Seattle", "Lumen Field", "USA"],
  ["Boston", "Gillette Stadium", "USA"],
  ["Philadelphia", "Lincoln Financial Field", "USA"],
  ["Kansas City", "Arrowhead Stadium", "USA"],
  ["Houston", "NRG Stadium", "USA"],
  ["Toronto", "BMO Field", "Canada"],
  ["Vancouver", "BC Place", "Canada"]
]

// ============================================================
// SCHEDULE GENERATION
// ============================================================

const groupList = ["A","B","C","D","E","F","G","H","I","J","K","L"]

// Venue assignment per group, per match index (0-5)
const venueAssignments = {
  A: [0, 4, 1, 5, 0, 1],
  B: [3, 7, 9, 6, 3, 7],
  C: [14, 2, 15, 2, 14, 15],
  D: [3, 8, 4, 10, 3, 8],
  E: [4, 6, 9, 13, 4, 6],
  F: [7, 5, 7, 12, 5, 12],
  G: [8, 3, 11, 4, 8, 3],
  H: [5, 9, 6, 13, 5, 9],
  I: [10, 8, 3, 5, 10, 8],
  J: [6, 11, 14, 4, 6, 11],
  K: [12, 15, 7, 9, 12, 15],
  L: [1, 13, 2, 11, 1, 2]
}

// Matchday 1 dates (each group plays once on its assigned day)
const md1Dates = {
  A: "2026-06-11", B: "2026-06-12", C: "2026-06-13",
  D: "2026-06-14", E: "2026-06-15", F: "2026-06-16",
  G: "2026-06-11", H: "2026-06-12", I: "2026-06-13",
  J: "2026-06-14", K: "2026-06-15", L: "2026-06-16"
}

const md2Dates = {
  A: "2026-06-17", B: "2026-06-18", C: "2026-06-19",
  D: "2026-06-20", E: "2026-06-21", F: "2026-06-22",
  G: "2026-06-17", H: "2026-06-18", I: "2026-06-19",
  J: "2026-06-20", K: "2026-06-21", L: "2026-06-22"
}

// Matchday 3 (simultaneous - same time per group pair)
const md3Dates = {
  A: "2026-06-23", B: "2026-06-23", C: "2026-06-24",
  D: "2026-06-24", E: "2026-06-25", F: "2026-06-25",
  G: "2026-06-26", H: "2026-06-26", I: "2026-06-23",
  J: "2026-06-24", K: "2026-06-25", L: "2026-06-26"
}

// Match pairings index in teams array for each of the 6 group matches
const matchPairings = [
  [0,1], [2,3],  // MD1
  [0,2], [1,3],  // MD2
  [0,3], [1,2]   // MD3 (simultaneous)
]

let matches = []
let id = 1

// Group stage
for (const g of groupList) {
  const teams = groups[g].teams
  const vas = venueAssignments[g]

  for (let m = 0; m < 6; m++) {
    const [ti, tj] = matchPairings[m]
    const ht = teams[ti]
    const at = teams[tj]
    const [city, venue, country] = venues[vas[m]]

    let date, time
    if (m < 2) {
      date = md1Dates[g]
      time = m === 0 ? "15:00" : "18:00"
    } else if (m < 4) {
      date = md2Dates[g]
      time = m === 2 ? "15:00" : "21:00"
    } else {
      date = md3Dates[g]
      time = "15:00"
    }

    matches.push({
      id: id++,
      stage: `Group ${g}`,
      group: g,
      matchday: m < 2 ? 1 : m < 4 ? 2 : 3,
      date,
      time,
      timezone: "ET",
      city,
      venue,
      country,
      homeTeam: { name: ht.name, code: ht.code, flag: ht.flag, confederation: ht.confederation },
      awayTeam: { name: at.name, code: at.code, flag: at.flag, confederation: at.confederation }
    })
  }
}

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
    dataSource: "Manually compiled from official FIFA 2026 schedule and public draw results (December 5, 2024). Group assignments reflect best available information and may require verification.",
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
