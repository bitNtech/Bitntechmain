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
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const updateScrollState = () => {
      frame = 0
      setIsScrolled(window.scrollY > 36)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateScrollState)
    }
    updateScrollState()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname])

  const closeAfterNavigate = () => {
    setTimeout(() => {
      if (toggleRef.current) toggleRef.current.checked = false
    }, 1000)
  }

  return (
    <div className="nav-05">
      <input ref={toggleRef} type="checkbox" id="nav-05-toggle" />
      <nav className={`nav-05__bar nav-05__pill${isScrolled ? ' is-scrolled' : ''}${pathname === '/hardware' || pathname === '/software' ? ' nav-05__pill--on-dark' : ''}`}>
        <Link to="/" className="nav-05__brand">
          <span className="nav-05__logo">BitN<em>Tech</em></span>
        </Link>

        <ul className="nav-05__links">
          {Object.entries(PAGE_LABELS)
            .filter(([path]) => path !== '/get-started')
            .map(([path, label]) => (
              <li key={path}>
                <Link to={path} tabIndex={isScrolled ? 0 : -1} className={pathname === path ? 'is-active' : ''}>{label}</Link>
              </li>
            ))}
        </ul>

        <div className="nav-05__actions">
          <Link to="/get-started" tabIndex={isScrolled ? 0 : -1} className="nav-05__cta">Get Started <span>↗</span></Link>
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
