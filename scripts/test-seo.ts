/* Run: node --experimental-strip-types scripts/test-seo.ts
 *
 * The route table is what the sitemap, the stamped <head> of every static HTML
 * file and the React <Seo> component are all generated from, so a mistake in it
 * is a mistake in all three at once — silently, because nothing on screen
 * changes. These are the assertions that would have caught the ones worth
 * catching: a duplicate title, a description search engines will truncate, a
 * canonical pointing at a page that is not in the sitemap. */
import assert from 'node:assert/strict'
import { ROUTES, SITE_URL, pageLd, routeSeo } from '../src/seo.ts'

const seen = new Set<string>()
for (const r of ROUTES) {
  assert.ok(r.path.startsWith('/'), `${r.path}: path must be absolute`)
  assert.ok(!seen.has(r.path), `${r.path}: duplicate route`)
  seen.add(r.path)

  /* Google renders roughly 60 characters of title and 160 of description; past
     that the tail is cut and the page is described by a fragment. */
  assert.ok(r.title.length <= 70, `${r.path}: title is ${r.title.length} chars`)
  assert.ok(r.description.length >= 70, `${r.path}: description too thin`)
  assert.ok(r.description.length <= 165, `${r.path}: description is ${r.description.length} chars`)
  assert.ok(r.keywords.length > 0, `${r.path}: no keywords`)
}

/* Two routes may share copy (get-started renders the contact page) but only
   ever one of them is indexable, and the other has to say where it belongs. */
const indexable = ROUTES.filter((r) => !r.noSitemap)
const titles = indexable.map((r) => r.title)
assert.equal(new Set(titles).size, titles.length, 'two indexable routes share a title')
for (const r of ROUTES.filter((r) => r.noSitemap)) {
  assert.ok(r.canonical, `${r.path}: kept out of the sitemap but has no canonical`)
  assert.ok(seen.has(r.canonical!), `${r.path}: canonical points at a route that does not exist`)
}

// An unknown URL falls back to the home entry rather than throwing.
assert.equal(routeSeo('/nope').path, '/')

// Every route carries structured data beyond the site-wide Organization/WebSite.
for (const r of ROUTES) {
  const ld = pageLd(r.path)
  assert.ok(ld.length > 0, `${r.path}: no page-level structured data`)
  for (const node of ld) {
    const j = JSON.stringify(node)
    assert.ok(j.includes('"@type"'), `${r.path}: structured data node has no @type`)
    // A relative URL in JSON-LD is not resolvable by the consumer.
    assert.ok(!/"(url|item)":"\/[^/]/.test(j), `${r.path}: relative URL in structured data`)
  }
}

assert.ok(SITE_URL.startsWith('https://') && !SITE_URL.endsWith('/'), 'SITE_URL must be an https origin with no trailing slash')

console.log('seo: ok')
