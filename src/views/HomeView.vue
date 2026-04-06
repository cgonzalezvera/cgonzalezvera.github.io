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
        <p class="hero__tz-note">⏰ All times shown in <strong>ET (Eastern Time)</strong></p>
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
          :show-local-time="true"
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
          :show-local-time="true"
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

      <div class="match-grid">
        <MatchCard
          v-for="match in stageMatches"
          :key="match.id"
          :match="match"
        />
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

const today = new Date().toISOString().slice(0, 10)
const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const todayMatches = computed<Match[]>(() =>
  data.matches.filter(m => m.date === today).sort((a, b) => a.time.localeCompare(b.time))
)

const upcomingMatches = computed<Match[]>(() => {
  const start = new Date(today)
  start.setDate(start.getDate() + 1)
  const end = new Date(today)
  end.setDate(end.getDate() + 7)
  return data.matches
    .filter(m => {
      const d = new Date(m.date + 'T00:00:00')
      return d >= start && d <= end
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
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

const stageMatches = computed<Match[]>(() =>
  data.matches
    .filter(m => m.stage === activeStage.value)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
)
</script>
