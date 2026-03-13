import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/electronic-lab-notebook/",
  plugins: [react()],
})