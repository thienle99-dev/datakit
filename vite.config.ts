import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
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
              if (id.includes('vue') || id.includes('vue-router')) {
                return 'vendor';
              }
              if (id.includes('lucide-vue-next')) {
                return 'lucide';
              }
              if (id.includes('xlsx') || id.includes('papaparse') || id.includes('js-yaml') || id.includes('jszip') || id.includes('uuid')) {
                return 'utils';
              }
            }
          }
        }
      }
    }
  }
})
