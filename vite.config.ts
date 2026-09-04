import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    /* Every browser that supports the CSS the site already relies on
       (`color-mix`, nesting, `@container`-era syntax) supports this, so there
       is nothing to gain from shipping older output. */
    target: 'es2022',
    /* Deliberately the default esbuild minifier and not lightningcss:
       lightningcss rewrites vendor prefixes against its own target list, and
       with no browserslist here it decided `-webkit-backdrop-filter` alone was
       enough and dropped the standard property. Chrome honours the alias;
       Firefox does not, so the nav's glass lost its blur there entirely.
       `build.cssTarget` does not reach lightningcss, so there is nothing to
       tune — the plain minifier leaves both declarations alone. */
    /* three.js alone is over 900 KB; the warning at 500 is noise here and the
       split below is what actually addresses it. */
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        /* React and the router are on the critical path for the first paint;
           three.js and its helpers are not, and are reached only from the two
           experience routes. Keeping them in separate files means a repeat
           visitor re-downloads neither when only page code changes.

           gsap and anime are deliberately left alone: anime belongs in the
           entry chunk because the landing page uses it, and gsap belongs in
           the About chunk because nothing else imports it. Naming a shared
           "motion" chunk would have made every visitor download both. */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
        },
      },
    },
  },
})
