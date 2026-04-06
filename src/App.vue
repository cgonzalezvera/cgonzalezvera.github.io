<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app-wrapper">
    <nav class="navbar">
      <div class="navbar__inner">
        <router-link to="/" class="navbar__brand">
          ⚽ FIFA World Cup 2026
        </router-link>
        <div class="navbar__links">
          <router-link to="/" class="navbar__link">Home</router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>
        FIFA World Cup 2026 · Mexico 🇲🇽 · USA 🇺🇸 · Canada 🇨🇦
      </p>
      <p class="footer__note">
        Data based on official FIFA 2026 schedule · All times in ET (Eastern Time)
      </p>
    </footer>
  </div>
</template>
