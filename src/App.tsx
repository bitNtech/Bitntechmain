import { Suspense, lazy, useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import Home from './pages/Home'

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={null}>
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
      <Suspense fallback={null}>
        <NilaCompanion />
      </Suspense>
      <BottomNav />
    </BrowserRouter>
  )
}

export default App
