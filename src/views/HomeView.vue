<template>
  <div class="home-view">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          <span class="hero__flag-row">🇲🇽 🇺🇸 🇨🇦</span>
          FIFA World Cup 2026
        </h1>
        <p class="hero__subtitle">June 11 – July 19, 2026 · 48 Teams · 104 Matches</p>
        <p class="hero__tz-note">⏰ Times shown in <strong>Argentina (ART)</strong> and <span class="hero__tz-secondary">ET</span></p>
      </div>
    </section>

    <!-- Country Search -->
    <section class="section search-section">
      <h2 class="section__title">🔍 Find a Country's Matches</h2>
      <TeamSearch :teams="data.teams" />
    </section>

    <!-- Today's Matches -->
    <section class="section">
      <h2 class="section__title">
        📅 Today's Matches
        <span class="section__title-date">{{ todayLabel }}</span>
      </h2>

      <div v-if="todayMatches.length" class="match-grid">
        <MatchCard
          v-for="match in todayMatches"
          :key="match.id"
          :match="match"
        />
      </div>
      <div v-else class="no-matches">
        <p>No matches scheduled for today.</p>
        <p class="no-matches__hint">
          The tournament runs from
          <strong>June 11</strong> to <strong>July 19, 2026</strong>.
          Browse upcoming matches below.
        </p>
      </div>
    </section>

    <!-- Upcoming Matches (next 7 days) -->
    <section v-if="upcomingMatches.length" class="section">
      <h2 class="section__title">⏭️ Upcoming Matches (Next 7 Days)</h2>
      <div class="match-grid">
        <MatchCard
          v-for="match in upcomingMatches"
          :key="match.id"
          :match="match"
        />
      </div>
    </section>

    <!-- Full Schedule by Stage -->
    <section class="section">
      <h2 class="section__title">📋 Full Schedule</h2>

      <div class="stage-tabs">
        <button
          v-for="stage in stageList"
          :key="stage"
          class="stage-tab"
          :class="{ 'stage-tab--active': activeStage === stage }"
          @click="activeStage = stage"
        >
          {{ stage }}
        </button>
      </div>

      <!-- Host-country filter -->
      <div class="filter-row">
        <span class="filter-label">🌎 País sede:</span>
        <button
          class="filter-btn"
          :class="{ 'filter-btn--active': activeCountry === '' }"
          @click="activeCountry = ''; activeCity = ''"
        >Todos</button>
        <button
          v-for="country in countryList"
          :key="country"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeCountry === country }"
          @click="activeCountry = country; activeCity = ''"
        >
          {{ countryFlag(country) }} {{ country }}
        </button>
      </div>

      <!-- City filter -->
      <div class="filter-row">
        <span class="filter-label">📍 Ciudad:</span>
        <button
          class="filter-btn"
          :class="{ 'filter-btn--active': activeCity === '' }"
          @click="activeCity = ''"
        >Todas</button>
        <button
          v-for="city in filteredCityList"
          :key="city"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeCity === city }"
          @click="activeCity = city"
        >
          {{ city }}
        </button>
      </div>

      <div v-if="stageMatches.length" class="match-grid">
        <MatchCard
          v-for="match in stageMatches"
          :key="match.id"
          :match="match"
        />
      </div>
      <div v-else class="no-matches">
        <p>No hay partidos con los filtros seleccionados.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MatchCard from '../components/MatchCard.vue'
import TeamSearch from '../components/TeamSearch.vue'
import fixturesData from '../data/fixtures.json'
import type { FixturesData, Match } from '../types'

const data = fixturesData as FixturesData

/** Get today's date in Argentina (UTC-3) as YYYY-MM-DD. */
function getTodayARG(): string {
  const now = new Date()
  const argOffset = -3 * 60
  const localOffset = now.getTimezoneOffset()
  const argMs = now.getTime() + (localOffset - argOffset) * 60 * 1000
  const arg = new Date(argMs)
  const y = arg.getFullYear()
  const m = String(arg.getMonth() + 1).padStart(2, '0')
  const d = String(arg.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayARG = getTodayARG()

const todayLabel = computed(() => {
  const [y, m, d] = todayARG.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const todayMatches = computed<Match[]>(() =>
  data.matches
    .filter(m => m.dateARG === todayARG)
    .sort((a, b) => a.timeARG.localeCompare(b.timeARG))
)

const upcomingMatches = computed<Match[]>(() => {
  const [ty, tm, td] = todayARG.split('-').map(Number)
  const start = new Date(ty, tm - 1, td + 1)
  const end   = new Date(ty, tm - 1, td + 7)
  return data.matches
    .filter(m => {
      const [y, mo, d] = m.dateARG.split('-').map(Number)
      const date = new Date(y, mo - 1, d)
      return date >= start && date <= end
    })
    .sort((a, b) => a.dateARG.localeCompare(b.dateARG) || a.timeARG.localeCompare(b.timeARG))
})

// Stage navigation
const stageList = computed(() => {
  const seen = new Set<string>()
  const stages: string[] = []
  for (const m of data.matches) {
    if (!seen.has(m.stage)) {
      seen.add(m.stage)
      stages.push(m.stage)
    }
  }
  return stages
})

const activeStage = ref(stageList.value[0] ?? '')

// Host-country filter
const activeCountry = ref('')
const activeCity = ref('')

const HOST_COUNTRY_FLAGS: Record<string, string> = {
  'México':         '🇲🇽',
  'Estados Unidos': '🇺🇸',
  'Canadá':         '🇨🇦',
}

function countryFlag(country: string): string {
  return HOST_COUNTRY_FLAGS[country] ?? ''
}

const countryList = computed(() => {
  const seen = new Set<string>()
  const countries: string[] = []
  for (const m of data.matches) {
    if (m.country && !seen.has(m.country)) {
      seen.add(m.country)
      countries.push(m.country)
    }
  }
  return countries
})

/** Cities for the active stage (and country filter if set). */
const filteredCityList = computed(() => {
  const seen = new Set<string>()
  const cities: string[] = []
  for (const m of data.matches) {
    if (m.stage !== activeStage.value) continue
    if (activeCountry.value && m.country !== activeCountry.value) continue
    if (m.city && !seen.has(m.city)) {
      seen.add(m.city)
      cities.push(m.city)
    }
  }
  return cities.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
})

const stageMatches = computed<Match[]>(() =>
  data.matches
    .filter(m => {
      if (m.stage !== activeStage.value) return false
      if (activeCountry.value && m.country !== activeCountry.value) return false
      if (activeCity.value && m.city !== activeCity.value) return false
      return true
    })
    .sort((a, b) => a.dateARG.localeCompare(b.dateARG) || a.timeARG.localeCompare(b.timeARG))
)
</script>
