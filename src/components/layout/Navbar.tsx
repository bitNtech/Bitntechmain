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

export default function Navbar() {
  const toggleRef = useRef<HTMLInputElement>(null)
  const progressSegmentsRef = useRef<(HTMLDivElement | null)[]>([])
  const { pathname } = useLocation()
  // Every page whose first screen is a dark ground — the bar sits on top of it.
  const isDarkPage = pathname === '/hardware' || pathname === '/software'
    || pathname === '/contact' || pathname === '/about' || pathname === '/get-started'
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
      
      const N = sectionsCount
      progressSegmentsRef.current.forEach((segment, i) => {
        if (!segment) return
        const localScrolled = Math.min(1, Math.max(0, scrolled * N - i))
        segment.style.width = `${localScrolled * 100}%`
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

  const closeAfterNavigate = () => {
    setTimeout(() => {
      if (toggleRef.current) toggleRef.current.checked = false
    }, 1000)
  }

  return (
    <div className="nav-05">
      <div className={`nav-05__progress${isDarkPage ? ' nav-05__progress--on-dark' : ''}`} aria-hidden="true">
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
      <input ref={toggleRef} type="checkbox" id="nav-05-toggle" />
      <nav className={`nav-05__bar${isScrolled ? ' is-scrolled' : ''}${isDarkPage ? ' nav-05__bar--on-dark' : ''}`}>
        <div className="nav-05__glass" aria-hidden="true">
          <div className="nav-05__glass-inner"></div>
        </div>
        <Link to="/" className="nav-05__brand">
          <span className="nav-05__logo">BitN<em>Tech</em></span>
        </Link>

        <ul className="nav-05__links">
          {Object.entries(PAGE_LABELS)
            .filter(([path]) => path !== '/get-started')
            .map(([path, label]) => (
              <li key={path}>
                <Link to={path} tabIndex={0} className={pathname === path ? 'is-active' : ''}>{label}</Link>
              </li>
            ))}
        </ul>

        <div className="nav-05__actions">
          <Link to="/get-started" tabIndex={0} className="nav-05__cta">Get Started <span>↗</span></Link>
          <label htmlFor="nav-05-toggle" className="nav-05__btn" aria-label="Open menu">
            <span></span><span></span><span></span>
          </label>
        </div>
      </nav>
      <div className="nav-05__overlay" role="dialog" aria-label="Full screen navigation">
        <ul className="nav-05__nav-list">
          <li><Link to="/" onClick={closeAfterNavigate}><span className="nav-05__num">01</span>Home</Link></li>
          <li><Link to="/hardware" onClick={closeAfterNavigate}><span className="nav-05__num">02</span>Hardware</Link></li>
          <li><Link to="/software" onClick={closeAfterNavigate}><span className="nav-05__num">03</span>Software</Link></li>
          <li><Link to="/about" onClick={closeAfterNavigate}><span className="nav-05__num">04</span>About</Link></li>
          <li><Link to="/contact" onClick={closeAfterNavigate}><span className="nav-05__num">05</span>Contact</Link></li>
        </ul>
        <div className="nav-05__overlay-footer">
          <div className="nav-05__overlay-social">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
          </div>
          <Link to="/get-started" className="nav-05__overlay-cta">Get Started →</Link>
        </div>
      </div>
      <svg className="nav-05__filters" aria-hidden="true" focusable="false">
        <filter id="nav-liquid-glass" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale="77" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  )
}
