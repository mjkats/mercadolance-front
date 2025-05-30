import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['abf8-2804-29b8-50eb-9416-e66b-ec44-9968-d1a9.ngrok-free.app']
  }
})
