import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    // ── Progressive Web App (PWA) ─────────────────────────────────────────
    // Makes the app installable on Android, iOS, and desktop browsers
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-512.png', 'logo.png'],
      manifest: {
        name:             'Quantum Terminal',
        short_name:       'Quantum',
        description:      'Institutional Trading Intelligence Platform',
        theme_color:      '#0a0d14',
        background_color: '#0a0d14',
        display:          'standalone',
        orientation:      'any',
        scope:            '/',
        start_url:        '/',
        id:               'com.quantumterminal.institutional',
        categories:       ['finance', 'productivity'],
        icons: [
          {
            src:     '/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable',
          },
          {
            src:     '/favicon.svg',
            sizes:   'any',
            type:    'image/svg+xml',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src:          '/icon-512.png',
            sizes:        '512x512',
            type:         'image/png',
            form_factor:  'narrow',
          },
        ],
        shortcuts: [
          {
            name:      'Dashboard',
            url:       '/',
            icons:     [{ src: '/icon-512.png', sizes: '512x512' }],
          },
          {
            name:      'Trading Desk',
            url:       '/trading',
            icons:     [{ src: '/icon-512.png', sizes: '512x512' }],
          },
          {
            name:      'Portfolio',
            url:       '/portfolio',
            icons:     [{ src: '/icon-512.png', sizes: '512x512' }],
          },
        ],
      },
      workbox: {
        // Cache strategy for app shell
        globPatterns:       ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            // API calls: network-first (always fresh data)
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName:          'quantum-api-cache',
              expiration:         { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
              networkTimeoutSeconds: 10,
              cacheableResponse:  { statuses: [0, 200] },
            },
          },
          {
            // Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler:    'CacheFirst',
            options:    { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],

  define: {
    'process.env': {}
  },

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // ── For Electron (loads relative paths from dist) ───────────────────────
  base: './',

  build: {
    outDir:    '../dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: { main: path.resolve(__dirname, 'index.html') },
      output: {
        // Better chunk splitting for performance
        manualChunks: {
          vendor:       ['react', 'react-dom', 'react-router-dom'],
          antd:         ['antd', '@ant-design/icons'],
          charts:       ['recharts', 'd3'],
          framer:       ['framer-motion'],
        },
      },
    },
  },

  server: {
    port:       5173,
    strictPort: true,
    host:       true,  // Expose on LAN so mobile devices can access http://<your-ip>:5173
    proxy: {
      '/api': {
        target:       'http://127.0.0.1:5000',
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});
