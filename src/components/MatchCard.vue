<template>
  <div class="match-card" :class="{ 'match-card--today': isToday, 'match-card--knockout': isKnockout }">
    <div class="match-card__header">
      <span class="match-card__stage">{{ match.stage }}</span>
      <span class="match-card__datetime">
        <span class="match-card__date">{{ formattedDate }}</span>
        <span class="match-card__time">{{ match.time }} ET</span>
        <span v-if="showLocalTime && localTime" class="match-card__local-time">({{ localTime }} local)</span>
      </span>
    </div>

    <div class="match-card__teams">
      <div class="match-card__team match-card__team--home">
        <span class="match-card__flag">{{ match.homeTeam.flag }}</span>
        <span class="match-card__team-name">{{ match.homeTeam.name }}</span>
        <span class="match-card__team-code">{{ match.homeTeam.code }}</span>
      </div>

      <div class="match-card__vs">VS</div>

      <div class="match-card__team match-card__team--away">
        <span class="match-card__team-code">{{ match.awayTeam.code }}</span>
        <span class="match-card__team-name">{{ match.awayTeam.name }}</span>
        <span class="match-card__flag">{{ match.awayTeam.flag }}</span>
      </div>
    </div>

    <div class="match-card__footer">
      <span class="match-card__venue">📍 {{ match.city }}, {{ match.country }}</span>
      <span class="match-card__venue-name">{{ match.venue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Match } from '../types'

const props = defineProps<{
  match: Match
  showLocalTime?: boolean
}>()

const isToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return props.match.date === today
})

const isKnockout = computed(() =>
  !props.match.stage.startsWith('Group')
)

const formattedDate = computed(() => {
  const [year, month, day] = props.match.date.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

const localTime = computed(() => {
  if (!props.showLocalTime) return null
  try {
    // Match times are in ET (UTC-4 during June/July - EDT)
    const [year, month, day] = props.match.date.split('-').map(Number)
    const [hour, minute] = props.match.time.split(':').map(Number)
    // Convert ET (UTC-4) to UTC, then display in local timezone
    const utcMs = Date.UTC(year, month - 1, day, hour + 4, minute)
    const local = new Date(utcMs)
    return local.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return null
  }
})
</script>
