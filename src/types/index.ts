export interface Team {
  name: string
  code: string
  flag: string
  confederation: string
  group?: string
}

export interface Match {
  id: number
  matchNumber: number
  stage: string
  group: string | null
  matchday: number | null
  date: string      // YYYY-MM-DD (ET date)
  dateARG: string   // YYYY-MM-DD (Argentina date; may differ when Hora_ARG crosses midnight)
  timeET: string    // HH:mm (Eastern Time)
  timeARG: string   // HH:mm (Argentina Time, UTC-3)
  city: string
  country: string
  team1: Team
  team2: Team
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
    primaryTimezone: string
    secondaryTimezone: string
    dataSource: string
    lastUpdated: string
  }
  teams: Team[]
  matches: Match[]
}
