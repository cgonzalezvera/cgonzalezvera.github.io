export interface Team {
  name: string
  code: string
  flag: string
  confederation: string
}

export interface Match {
  id: number
  stage: string
  group: string | null
  matchday: number | null
  date: string      // YYYY-MM-DD
  time: string      // HH:mm
  timezone: string  // "ET"
  city: string
  venue: string
  country: string
  homeTeam: Team
  awayTeam: Team
}

export interface FixturesData {
  metadata: {
    tournament: string
    edition: number
    hostCountries: string[]
    openingMatch: string
    final: string
    totalTeams: number
    totalGroups: number
    totalMatches: number
    timezone: string
    dataSource: string
    lastUpdated: string
  }
  teams: Team[]
  matches: Match[]
}
