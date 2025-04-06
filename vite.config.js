import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/SteppingMaster/',
  server: {
    port: 9204,
    host: true
  },
  build: {
    rollupOptions: {
      external: [
        '@mediapipe/pose',
        '@mediapipe/camera_utils',
        '@mediapipe/drawing_utils'
      ]
    }
  }
})
