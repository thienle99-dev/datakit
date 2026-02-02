import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null) || 'https://datakit.vercel.app'

  return {
    plugins: [
      vue(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      {
        name: 'html-transform-seo',
        transformIndexHtml(html) {
          return html.replace(/__SITE_URL__/g, siteUrl)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@views': path.resolve(__dirname, './src/views'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@composables': path.resolve(__dirname, './src/composables'),
        '@router': path.resolve(__dirname, './src/router'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // Vendor Core
              if (id.includes('vue') && !id.includes('vue-router') && !id.includes('lucide') && !id.includes('apexcharts')) {
                return 'vue-core';
              }
              if (id.includes('vue-router')) {
                return 'vue-router';
              }

              // UI Libs
              if (id.includes('lucide-vue-next')) {
                return 'ui-icons';
              }

              // Heavy Data Libs - Split individually
              if (id.includes('xlsx')) {
                return 'lib-xlsx'; // Very large, keep isolated
              }
              if (id.includes('@faker-js')) {
                return 'lib-faker'; // Very large, keep isolated
              }
              if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) {
                return 'lib-charts'; // Very large, catch both core and vue wrapper
              }

              // Data Utilities - Split for finer granularity
              if (id.includes('papaparse')) return 'lib-papaparse';
              if (id.includes('jszip')) return 'lib-jszip';
              if (id.includes('js-yaml')) return 'lib-yaml';
              if (id.includes('uuid')) return 'lib-uuid';
            }
          }
        }
      }
    }
  }
})
