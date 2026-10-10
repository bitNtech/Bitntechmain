import { useLocation } from 'react-router-dom'
import { NOT_FOUND, ORGANIZATION_LD, SITE_NAME, SITE_URL, WEBSITE_LD, routeSeo, pageLd, OG_IMAGE } from '../seo'

/**
 * Per-route <head>. React 19 hoists `<title>`, `<meta>` and `<link>` out of the
 * tree into the document head on its own, so this needs no helmet library — it
 * is a component that renders head tags and nothing else.
 *
 * `scripts/seo-build.ts` stamps the same tags into each route's static HTML so
 * a crawler that never runs JavaScript still gets them. Those carry
 * `data-static-seo`; they are dropped the moment React takes over the head,
 * or the document would carry two of everything.
 */
let staticSeoCleared = false
function clearStaticSeo() {
  if (staticSeoCleared || typeof document === 'undefined') return
  staticSeoCleared = true
  document.head.querySelectorAll('[data-static-seo]').forEach((el) => el.remove())
}

export default function Seo() {
  const { pathname } = useLocation()
  const seo = routeSeo(pathname)
  const canonical = SITE_URL + (seo.canonical ?? seo.path)
  clearStaticSeo()

  /* An unknown URL gets the not-found page. The host already answered it with
     a 404 status; this keeps it out of the index after client-side navigation
     too, with no canonical pointing anywhere. */
  if (seo.path !== pathname) {
    return (
      <>
        <title>{NOT_FOUND.title}</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content={NOT_FOUND.description} />
      </>
    )
  }

  const graph = [ORGANIZATION_LD, WEBSITE_LD, ...pageLd(seo.path)]

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  )
}
