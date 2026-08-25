import { useRef } from 'react'
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
  const pageLabel = PAGE_LABELS[pathname]

  const closeAfterNavigate = () => {
    setTimeout(() => {
      if (toggleRef.current) toggleRef.current.checked = false
    }, 1000)
  }

  return (
    <div className="nav-05">
      <input ref={toggleRef} type="checkbox" id="nav-05-toggle" />
      <nav className="nav-05__bar">
        <Link to="/" className="nav-05__logo">BitN<em>Tech</em></Link>
        {pageLabel && <span className="nav-05__page-label" aria-hidden="true">{pageLabel}</span>}
        <label htmlFor="nav-05-toggle" className="nav-05__btn" aria-label="Open menu">
          <span></span><span></span><span></span>
        </label>
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
    </div>
  )
}
