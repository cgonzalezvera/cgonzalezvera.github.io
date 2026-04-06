import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// GitHub Pages: repo is cgonzalezvera.github.io (user/org page), so base is '/'
export default defineConfig({
  plugins: [vue()],
  base: '/',
})
