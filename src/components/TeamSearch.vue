<template>
  <div class="team-search">
    <div class="team-search__input-wrapper">
      <input
        v-model="query"
        type="text"
        class="team-search__input"
        placeholder="Search for a country..."
        @focus="showDropdown = true"
        @blur="onBlur"
        aria-label="Search country"
        autocomplete="off"
      />
      <span v-if="query" class="team-search__clear" @mousedown.prevent="clearQuery">✕</span>
    </div>
    <ul v-if="showDropdown && filteredTeams.length" class="team-search__dropdown">
      <li
        v-for="team in filteredTeams"
        :key="team.code"
        class="team-search__option"
        @mousedown.prevent="selectTeam(team)"
      >
        <span class="team-search__option-flag">{{ team.flag }}</span>
        <span class="team-search__option-name">{{ team.name }}</span>
        <span class="team-search__option-code">{{ team.code }}</span>
      </li>
    </ul>
    <p v-else-if="showDropdown && query.length >= 1 && !filteredTeams.length" class="team-search__no-results">
      No teams found for "{{ query }}"
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Team } from '../types'

const props = defineProps<{
  teams: Team[]
}>()

const router = useRouter()
const query = ref('')
const showDropdown = ref(false)

const filteredTeams = computed(() => {
  if (!query.value) return props.teams.slice().sort((a, b) => a.name.localeCompare(b.name))
  return props.teams
    .filter(t =>
      t.name.toLowerCase().includes(query.value.toLowerCase()) ||
      t.code.toLowerCase().includes(query.value.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))
})

function selectTeam(team: Team) {
  query.value = team.name
  showDropdown.value = false
  router.push({ name: 'team', params: { code: team.code } })
}

function clearQuery() {
  query.value = ''
  showDropdown.value = true
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}
</script>
