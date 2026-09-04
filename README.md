# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

---

## SEO / AEO build

`npm run build` runs three steps: `tsc -b`, `vite build`, then
`node --experimental-strip-types scripts/seo-build.ts`.

`src/seo.ts` is the single source of truth — the canonical origin, one entry per
route (title, description, keywords, canonical, sitemap priority), and all the
structured data. Three consumers read it:

| consumer | what it does |
| --- | --- |
| `src/components/Seo.tsx` | renders the head for the live app; React 19 hoists the tags, so no helmet library |
| `scripts/seo-build.ts` | writes `dist/sitemap.xml` and one `dist/<route>/index.html` per route with that route's head stamped in, plus a `<noscript>` summary |
| `scripts/test-seo.ts` | asserts titles and descriptions stay inside search-result limits, no duplicates, every canonical resolves (`npm test`) |

Adding a page means adding a route to `ROUTES` in `src/seo.ts` and a `<Route>`
in `App.tsx`. Nothing else needs touching.

### Hosting requirements

The build emits real files at `dist/about/index.html`, `dist/contact/index.html`
and so on. **The host must prefer an existing file over the SPA fallback**, or
every URL is served the home page's `<head>` and the per-route metadata is lost
for crawlers that do not run JavaScript — which is most AI answer engines.

* **Netlify / Cloudflare Pages** — works as shipped. `public/_redirects` carries
  the `/* /index.html 200` fallback, and both check for a matching file first.
  `public/_headers` sets immutable caching on `/assets/*` and revalidation on HTML.
* **Vercel** — set `"cleanUrls": true` in `vercel.json` and do *not* add a
  catch-all rewrite to `/index.html`; add a `404` fallback instead.
* **nginx** — `try_files $uri $uri/index.html /index.html;`
* `vite preview` does *not* do this (its SPA fallback wins), so route metadata
  looks wrong there. It is correct in `dist/`.

Before going live, replace `SITE_URL` in `src/seo.ts` and the `Sitemap:` line in
`public/robots.txt` if the domain is not `https://bitntech.in`.
