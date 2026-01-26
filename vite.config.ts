import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

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
  }
})
