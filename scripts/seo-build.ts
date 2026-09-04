/**
 * Post-build step. Two jobs, both aimed at crawlers that never run JavaScript
 * — which is most AI answer engines and every social unfurler:
 *
 *  1. dist/sitemap.xml, generated from the same route table the app uses.
 *  2. One dist/<route>/index.html per route, identical to the SPA shell except
 *     that its <head> already carries that route's title, description,
 *     canonical, Open Graph and JSON-LD, and its <body> carries a <noscript>
 *     summary with the site's real headings and internal links.
 *
 * The stamped tags are marked `data-static-seo`; components/Seo.tsx removes
 * them the moment React takes over the head, so the document never carries two
 * of anything. A host that serves dist/ with the usual "try the file, then fall
 * back to index.html" rule picks these up with no extra configuration.
 *
 * Run: node --experimental-strip-types scripts/seo-build.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTACT } from '../src/contact.ts'
import {
  FAQ,
  ORGANIZATION_LD,
  OG_IMAGE,
  ROUTES,
  SITE_NAME,
  SITE_URL,
  WEBSITE_LD,
  pageLd,
} from '../src/seo.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* --- sitemap ------------------------------------------------------------ */
const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.filter((r) => !r.noSitemap)
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r.priority ?? '0.5'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

/* --- per-route head + noscript ------------------------------------------ */

/** The link graph and the headline content, in plain HTML, for a JS-less read. */
const noscriptBody = (path: string) => `
    <noscript>
      <h1>${esc(ROUTES.find((r) => r.path === path)!.title)}</h1>
      <p>${esc(ROUTES.find((r) => r.path === path)!.description)}</p>
      <nav aria-label="Site">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/software">Software &amp; AI development services</a></li>
          <li><a href="/hardware">Robotics, IoT &amp; embedded hardware engineering</a></li>
          <li><a href="/about">About the BitNTech team</a></li>
          <li><a href="/contact">Contact BitNTech</a></li>
        </ul>
      </nav>
      <h2>Frequently asked questions</h2>
      <dl>
${FAQ.map(({ q, a }) => `        <dt>${esc(q)}</dt>\n        <dd>${esc(a)}</dd>`).join('\n')}
      </dl>
      <h2>Contact</h2>
      <p>
        <a href="${CONTACT.emailHref}">${esc(CONTACT.email)}</a> ·
        <a href="${CONTACT.phoneHref}">${esc(CONTACT.phone)}</a>
      </p>
    </noscript>`

function head(path: string): string {
  const r = ROUTES.find((x) => x.path === path)!
  const canonical = SITE_URL + (r.canonical ?? r.path)
  const tag = (s: string) => `    ${s}`
  const meta = (attr: string, name: string, content: string) =>
    tag(`<meta data-static-seo ${attr}="${name}" content="${esc(content)}" />`)

  return [
    tag(`<title data-static-seo>${esc(r.title)}</title>`),
    /* The landing hero's figure is that page's LCP element and is reached only
       through JS-rendered markup, so the parser needs telling. Only here: on
       every other route it is never referenced, and preloading it from the
       shared shell was fetching 68 KB nothing would use. */
    ...(path === '/'
      ? [tag('<link data-static-seo rel="preload" as="image" href="/assets/hero-embryo.jpg" fetchpriority="high" />')]
      : []),
    meta('name', 'description', r.description),
    meta('name', 'keywords', r.keywords),
    tag(`<link data-static-seo rel="canonical" href="${canonical}" />`),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', SITE_NAME),
    meta('property', 'og:title', r.title),
    meta('property', 'og:description', r.description),
    meta('property', 'og:url', canonical),
    meta('property', 'og:image', OG_IMAGE),
    meta('property', 'og:locale', 'en_IN'),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', r.title),
    meta('name', 'twitter:description', r.description),
    meta('name', 'twitter:image', OG_IMAGE),
    ...[ORGANIZATION_LD, WEBSITE_LD, ...pageLd(path)].map((ld) =>
      tag(
        `<script data-static-seo type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
      ),
    ),
  ].join('\n')
}

const shell = readFileSync(join(dist, 'index.html'), 'utf8')
if (!shell.includes('</head>')) throw new Error('seo-build: dist/index.html has no </head>')

for (const r of ROUTES) {
  const html = shell
    /* The shell carries a generic title and description as the fallback for a
       URL with no stamped file of its own. Where there is one, that pair has
       to come out or the page ships two of each and a crawler reads the
       generic one. */
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace('</head>', `${head(r.path)}\n  </head>`)
    .replace('<body>', `<body>${noscriptBody(r.path)}`)
  const out = r.path === '/' ? join(dist, 'index.html') : join(dist, r.path.slice(1), 'index.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
}

writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`seo-build: ${ROUTES.length} routes stamped, sitemap.xml written`)
