<template>
  <div class="match-card" :class="{ 'match-card--today': isToday, 'match-card--knockout': isKnockout }">
    <div class="match-card__header">
      <span class="match-card__stage">{{ match.stage }}</span>
      <span class="match-card__datetime">
        <span class="match-card__date">{{ formattedDate }}</span>
        <span class="match-card__time">{{ match.timeARG }} ARG</span>
        <span class="match-card__time-et">({{ match.timeET }} ET)</span>
      </span>
    </div>

    <div class="match-card__teams">
      <div class="match-card__team match-card__team--home">
        <span v-if="match.team1.flag" class="match-card__flag">{{ match.team1.flag }}</span>
        <span class="match-card__team-name">{{ match.team1.name }}</span>
      </div>

      <div class="match-card__vs">VS</div>

      <div class="match-card__team match-card__team--away">
        <span class="match-card__team-name">{{ match.team2.name }}</span>
        <span v-if="match.team2.flag" class="match-card__flag">{{ match.team2.flag }}</span>
      </div>
    </div>

    <div class="match-card__footer">
      <span class="match-card__venue">📍 {{ match.city }}</span>
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
  const todayARG = getTodayARG()
  return props.match.dateARG === todayARG
})

const isKnockout = computed(() =>
  props.match.stage !== 'Fase de Grupos'
)

const formattedDate = computed(() => {
  const [year, month, day] = props.match.dateARG.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
})

/** Get today's date in Argentina (UTC-3) as YYYY-MM-DD. */
function getTodayARG(): string {
  const now = new Date()
  // Argentina is UTC-3 (no daylight saving)
  const argOffset = -3 * 60
  const localOffset = now.getTimezoneOffset()
  const argMs = now.getTime() + (localOffset - argOffset) * 60 * 1000
  const arg = new Date(argMs)
  const y = arg.getFullYear()
  const m = String(arg.getMonth() + 1).padStart(2, '0')
  const d = String(arg.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>
