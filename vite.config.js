import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://124.156.230.187:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/openai-api': {
        target: 'https://api2.qiandao.mom',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Origin', 'https://key-check.qiandao.mom')
            proxyReq.setHeader('Referer', 'https://key-check.qiandao.mom/')
          })
        }
      }
    }
  }
})
