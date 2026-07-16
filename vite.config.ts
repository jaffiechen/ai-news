import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/ai-news/' : '/',
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'AI快讯',
        short_name: 'AI快讯',
        description: '追踪AI前沿动态',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-news-assets',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /latest-(24h|7d)\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ai-news-data',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ai-news-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})