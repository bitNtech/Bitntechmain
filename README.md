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

There is deliberately **no SPA catch-all**. The build also writes
`dist/404.html` (noindex), and every host below serves it with a real 404
status for a URL no route claims. A catch-all to `/index.html` answered every
mistyped URL with the home page and a 200 — a soft 404.

* **Vercel** — works as shipped. `vercel.json` holds the 301s (`/get-started`
  and the old `.jpg`/`.png` image URLs) and an `X-Robots-Tag: noindex` header
  on `*.vercel.app` hosts so deployment URLs stay out of search.
* **Netlify / Cloudflare Pages** — works as shipped. `public/_redirects` holds
  the same 301s; `public/_headers` sets the cache rules.
* **nginx** — `try_files $uri $uri/index.html =404; error_page 404 /404.html;`
* `vite preview` does *not* do this (its SPA fallback wins), so route metadata
  looks wrong there. It is correct in `dist/`.

`SITE_URL` in `src/seo.ts` is `https://www.bitntech.in` because production
308-redirects the apex to `www`; canonicals must point at the host that answers
with a 200. If the primary domain changes in Vercel, change `SITE_URL` and the
`Sitemap:` line in `public/robots.txt` together (`npm test` checks they agree).

### Images and media

Photos in `public/assets` are WebP (Pillow, quality ~78); `logo.png` and
`og-cover.png` stay PNG for favicon and social-card compatibility. The AICA film
is 720p H.264 with `+faststart`, so it plays before it finishes downloading.

### Manual Search Console steps

1. Add a **Domain property** for `bitntech.in` in Google Search Console and
   verify with the DNS TXT record it gives you (covers apex, `www`, http and
   https at once, no code change).
2. Submit `https://www.bitntech.in/sitemap.xml` under *Sitemaps*.
3. Run *URL Inspection → Test live URL* on `/`, `/software`, `/products` and
   `/about`; check the rendered HTML shows the page's H1 and title.
4. Revisit *Pages* (index coverage) after a week for soft 404s, redirects or
   "Duplicate without user-selected canonical".

---

## Products and enquiries

* `src/data/products.ts` is the catalogue. Add a record there to add a card to
  `/products`; the page, its structured data and the noscript summary read it.
* `src/contact.ts` holds every contact detail, the WhatsApp number
  (`CONTACT.whatsapp`, digits only with country code) and the product-specific
  WhatsApp openers (`WA_MESSAGES`).
* The Smart Business Card form (`/products/smart-business-card`) has no
  backend. It validates in the browser, then opens WhatsApp click-to-chat or an
  email draft with the enquiry prefilled; the visitor presses Send. Nothing is
  stored. To deliver enquiries without that step, add a server endpoint (e.g. a
  Vercel function) that sends mail with credentials kept in server-side
  environment variables, add a honeypot/rate limit there, and post the form to
  it — never put SMTP or API keys in `src/`.
