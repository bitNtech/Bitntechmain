import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/hardware': 'Hardware',
  '/software': 'Software',
  '/about': 'About',
  '/contact': 'Contact',
  '/get-started': 'Get Started',
}

/**
 * Whether the page's own ground under a point is dark, or null if nothing
 * opaque is there. `elementsFromPoint` hands back the stack topmost-first,
 * ancestors included, so the first opaque background it finds is the one you
 * would actually see through the bar.
 */
function isDark(color: string): boolean | null {
  const rgb = color.match(/[\d.]+/g)
  if (!rgb || rgb.length < 3 || Number(rgb[3] ?? 1) < 0.5) return null
  const [r, g, b] = rgb.map(Number)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55
}

function groundIsDark(x: number, y: number): boolean | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest('.nav-05')) continue
    const style = getComputedStyle(el)
    // Decorative washes (glows, grids) sit above the ground but aren't it.
    if (style.mixBlendMode !== 'normal' || Number(style.opacity) < 0.9) continue
    const flat = isDark(style.backgroundColor)
    if (flat !== null) return flat
    /* Several heroes paint themselves with a gradient and no background-color;
       reading only backgroundColor fell through them to the cream body and left
       the wordmark black on dark. Computed gradients list their stops as rgb(),
       so the first opaque stop is a good enough sample. */
    for (const stop of style.backgroundImage.match(/rgba?\([^)]*\)/g) ?? []) {
      const g = isDark(stop)
      if (g !== null) return g
    }
  }
  return null
}

export default function Navbar() {
  const brandRef = useRef<HTMLAnchorElement>(null)
  const progressSegmentsRef = useRef<(HTMLDivElement | null)[]>([])
  const { pathname } = useLocation()
  /* What is behind the wordmark, measured rather than listed. A list of "dark
     routes" is wrong twice over: it missed Home, whose hero is dark, and it
     cannot know that scrolling Home moves the bar off that hero and onto a
     cream section. So sample the ground under the wordmark itself. */
  /* On the contact page the CTA points at the page you are already on, so it
     is dropped there. /get-started renders ContactUs as well - see App.tsx. */
  const onContact = pathname === '/contact' || pathname === '/get-started'
  const [onDark, setOnDark] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [sectionsCount, setSectionsCount] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Find sections or main containers to count segments
      const sections = document.querySelectorAll('section')
      setSectionsCount(sections.length > 0 ? sections.length : 1)
    }, 150)
    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    let frame = 0
    const updateScrollState = () => {
      frame = 0
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 36)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0
      
      /* `scaleX`, not `width`. Width is a layout property: writing it to six
         or eight segments on every scroll frame made the browser re-lay-out a
         fixed, full-width element for the whole length of every page. A
         transform is the compositor's job and costs nothing. */
      const N = sectionsCount
      progressSegmentsRef.current.forEach((segment, i) => {
        if (!segment) return
        const localScrolled = Math.min(1, Math.max(0, scrolled * N - i))
        segment.style.transform = `scaleX(${localScrolled})`
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScrollState)
    }
    updateScrollState()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname, sectionsCount])

  useEffect(() => {
    let frame = 0
    let idle = 0
    // -Infinity so the first probe of a route always runs.
    let probedAt = -Infinity

    const probe = () => {
      frame = 0
      probedAt = window.scrollY
      const box = brandRef.current?.getBoundingClientRect()
      if (!box) return
      const dark = groundIsDark(box.left + box.width / 2, box.top + box.height / 2)
      if (dark !== null) setOnDark(dark)
    }

    /* `groundIsDark` hit-tests the point under the wordmark and reads computed
       style off everything it finds, which flushes layout and resolves style
       for a handful of elements — perfectly affordable, and it was running on
       every scroll frame of every page.

       What it produces is one boolean that only changes where a section
       boundary passes under the bar. So it runs when the page has actually
       moved far enough for that to be possible, and once more shortly after
       scrolling stops, which catches a boundary crossed inside the threshold.
       Same answer, a fraction of the work. */
    const STEP = 32
    const onScroll = () => {
      window.clearTimeout(idle)
      idle = window.setTimeout(probe, 120)
      if (Math.abs(window.scrollY - probedAt) < STEP) return
      if (!frame) frame = requestAnimationFrame(probe)
    }

    probe()
    // The route's first paint has not landed on the frame this runs in.
    const settle = window.setTimeout(probe, 220)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(idle)
      window.clearTimeout(settle)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <div className="nav-05">
      <div className={`nav-05__progress${onDark ? ' nav-05__progress--on-dark' : ''}`} aria-hidden="true">
        <div className="nav-05__progress-track">
          {Array.from({ length: sectionsCount }).map((_, i) => (
            <div key={i} className="nav-05__progress-segment">
              <div 
                ref={el => { progressSegmentsRef.current[i] = el }} 
                className="nav-05__progress-fill" 
              />
            </div>
          ))}
        </div>
      </div>
      <nav aria-label="Primary" className={`nav-05__bar${isScrolled ? ' is-scrolled' : ''}${onDark ? ' nav-05__bar--on-dark' : ''}`}>
        <div className="nav-05__glass" aria-hidden="true">
          <div className="nav-05__glass-inner"></div>
        </div>
        <Link to="/" className="nav-05__brand" ref={brandRef}>
          <span className="nav-05__logo">BitN<em>Tech</em></span>
        </Link>

        <ul className="nav-05__links">
          {Object.entries(PAGE_LABELS)
            .filter(([path]) => path !== '/get-started')
            .map(([path, label]) => (
              <li key={path}>
                <Link to={path} tabIndex={0} viewTransition className={pathname === path ? 'is-active' : ''}>{label}</Link>
              </li>
            ))}
        </ul>

        <div className="nav-05__actions">
          {!onContact && <Link to="/get-started" tabIndex={0} className="nav-05__cta">Get Started <span>↗</span></Link>}
        </div>
      </nav>
    </div>
  )
}
