import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Seo from './components/Seo'
import Home from './pages/Home'
import { canAffordHeavyMedia } from './lib/utils'

/* three.js and drei are most of the bundle. Loaded eagerly they sit in front of
   the very first paint, so the landing page waits on a robot nobody has scrolled
   to yet. Split out, the hero paints on the small chunk and the 3D arrives when
   it is ready — every one of these already renders nothing while it loads. */
const NilaCompanion = lazy(() => import('./components/robot/NilaCompanion'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))

/**
 * A router without this lands every new page at the scroll offset of the one
 * you left, so /contact would open halfway down. Reset before paint, and
 * instantly — :root sets scroll-behavior: smooth, which would otherwise turn a
 * route change into a long scroll through the page you just left. In-page
 * anchors keep the smooth behaviour, since only this call opts out.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * When Nila is allowed to arrive.
 *
 * She is a WebGL mascot: her chunk pulls in three.js and a 2 MB model, and she
 * used to mount 1.5s after every route change — which put ~3 MB of download and
 * a three.js parse right in the middle of the window LCP is measured in, on
 * every page. She is decoration, so she waits for the page to finish loading
 * and for the browser to be idle, and on a device or connection that cannot
 * afford her she simply does not come (the FAQ section on the home page carries
 * the same answers her chat does).
 */
function useNilaReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!canAffordHeavyMedia()) return
    let idle = 0
    const start = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 800))
      idle = ric(() => setReady(true), { timeout: 4000 }) as unknown as number
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      window.cancelIdleCallback?.(idle)
    }
  }, [])
  return ready
}

function App() {
  const nilaReady = useNilaReady()
  return (
    <BrowserRouter>
      <Seo />
      <ScrollToTop />
      {/* Keyboard and screen-reader users otherwise tab the whole nav on every
          route. Visually hidden until focused — see index.css. */}
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      {/* `fallback={null}` left a zero-height hole where the page goes, so the
          footer painted at the top of the viewport and was then shoved a whole
          screen down when the route chunk arrived — a layout shift of about
          1.0, on every route that is not Home. The placeholder is the route's
          own ground at the route's own height, so nothing moves when the real
          page replaces it. */}
      <Suspense fallback={<div className="route-fallback" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/hardware" element={<ExperiencePage mode="hardware" />} />
          <Route path="/software" element={<ExperiencePage mode="software" />} />
          {/* The nav's "Get Started" CTA pointed at a route that did not exist,
              leaving a blank page. Contact is where that intent lands. */}
          <Route path="/get-started" element={<ContactUs />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <Footer />
      {nilaReady && (
        <Suspense fallback={null}>
          <NilaCompanion />
        </Suspense>
      )}
    </BrowserRouter>
  )
}

export default App
