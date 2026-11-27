import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages публикует сайт по адресу https://<owner>.github.io/<repo>/,
// поэтому базовый путь должен совпадать с именем репозитория.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/glucose-tracker/',
})
