import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
        rewrite: (path) => path.replace(/^\/byteplus-api/, '')
      },
      '/zalo-bot-api': {
        target: 'https://bot-api.zaloplatforms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zalo-bot-api/, '')
      }
    }
  }
})
