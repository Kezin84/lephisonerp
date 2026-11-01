import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sonaiMockAndConfigPlugin } from './viteMockPlugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    sonaiMockAndConfigPlugin(__dirname),
    vue()
  ],
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/byteplus-api': {
        target: 'https://ark.ap-southeast.bytepluses.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/byteplus-api/, '')
      },
      '/zalo-bot-api': {
        target: 'https://bot-api.zaloplatforms.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/zalo-bot-api/, '')
      }
    }
  }
})
