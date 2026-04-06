<template>
  <div class="team-view">
    <div v-if="team" class="team-view__content">
      <!-- Header -->
      <div class="team-header">
        <router-link to="/" class="back-btn">← Back to Home</router-link>
        <div class="team-header__info">
          <span class="team-header__flag">{{ team.flag }}</span>
          <div>
            <h1 class="team-header__name">{{ team.name }}</h1>
            <p class="team-header__meta">
              {{ team.confederation }} · {{ teamMatches.length }} matches
            </p>
          </div>
        </div>
      </div>

      <!-- Group Info -->
      <div v-if="groupInfo" class="team-group-info">
        <h2>Group {{ groupInfo }}</h2>
        <div class="group-teams">
          <span
            v-for="t in groupTeams"
            :key="t.code"
            class="group-team-chip"
            :class="{ 'group-team-chip--active': t.code === code }"
          >
            <router-link
              v-if="t.code !== code"
              :to="{ name: 'team', params: { code: t.code } }"
              class="group-team-link"
            >
              {{ t.flag }} {{ t.name }}
            </router-link>
            <span v-else>{{ t.flag }} {{ t.name }}</span>
          </span>
        </div>
      </div>

      <!-- Timezone note -->
      <p class="tz-note">⏰ Times shown in <strong>Argentina (ART)</strong> and <span class="tz-secondary">ET</span></p>

      <!-- Matches -->
      <div v-if="teamMatches.length" class="match-grid">
        <MatchCard
          v-for="match in teamMatches"
          :key="match.id"
          :match="match"
        />
      </div>
      <p v-else class="no-matches">No matches found for this team.</p>
    </div>

    <div v-else class="team-view__not-found">
      <h2>Team not found</h2>
      <p>No team with code "{{ code }}" was found in the tournament.</p>
      <router-link to="/" class="back-btn">← Back to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MatchCard from '../components/MatchCard.vue'
import fixturesData from '../data/fixtures.json'
import type { FixturesData, Match, Team } from '../types'

const props = defineProps<{
  code: string
}>()

const data = fixturesData as FixturesData

const team = computed<Team | undefined>(() =>
  data.teams.find(t => t.code === props.code)
)

const teamMatches = computed<Match[]>(() =>
  data.matches
    .filter(m =>
      m.team1.code === props.code ||
      m.team2.code === props.code
    )
    .sort((a, b) => a.dateARG.localeCompare(b.dateARG) || a.timeARG.localeCompare(b.timeARG))
)

const groupInfo = computed(() => {
  const match = teamMatches.value.find(m => m.group)
  return match?.group ?? null
})

const groupTeams = computed<Team[]>(() => {
  if (!groupInfo.value) return []
  // Find all real teams in the same group
  const groupMatches = data.matches.filter(m => m.group === groupInfo.value)
  const teamCodes = new Set<string>()
  const teams: Team[] = []
  for (const m of groupMatches) {
    for (const t of [m.team1, m.team2]) {
      if (!teamCodes.has(t.code)) {
        teamCodes.add(t.code)
        const found = data.teams.find(dt => dt.code === t.code)
        if (found) teams.push(found)
      }
    }
  }
  return teams
})
</script>
