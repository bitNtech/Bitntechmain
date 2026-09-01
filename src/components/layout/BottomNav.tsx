import { NavLink, useLocation } from 'react-router-dom'
import './BottomNav.css'

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.2 12 3l9 7.2" />
    <path d="M5.5 9.2V20h13V9.2" />
    <path d="M9.8 20v-5.4h4.4V20" />
  </svg>
)

const IconSoftware = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 21 7.5 12 12 3 7.5Z" />
    <path d="M3 12.2 12 16.7l9-4.5" />
    <path d="M3 16.7 12 21.2l9-4.5" />
  </svg>
)

const IconHardware = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="8" height="8" rx="1.2" />
    <path d="M8 10.5H5M8 13.5H5M19 10.5h-3M19 13.5h-3M10.5 8V5M13.5 8V5M10.5 19v-3M13.5 19v-3" />
  </svg>
)

const IconAbout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.4 19.5c.7-3.1 3-4.8 5.6-4.8s4.9 1.7 5.6 4.8" />
    <path d="M16.2 6.3a3 3 0 0 1 0 5.6M18 15.2c1.6.7 2.4 2.2 2.7 4.3" />
  </svg>
)

const IconContact = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="m3.8 7 8.2 5.8L20.2 7" />
  </svg>
)

const TABS = [
  { to: '/', label: 'Home', Icon: IconHome },
  { to: '/software', label: 'Software', Icon: IconSoftware },
  { to: '/hardware', label: 'Hardware', Icon: IconHardware },
  { to: '/about', label: 'About', Icon: IconAbout },
  { to: '/contact', label: 'Contact', Icon: IconContact },
] as const

export default function BottomNav() {
  const { pathname } = useLocation()
  // The dark pages carry their own near-black ground, so the bar inverts to
  // stay readable instead of stamping a light slab over them.
  const isDark = pathname === '/hardware' || pathname === '/software'
    || pathname === '/contact' || pathname === '/about' || pathname === '/get-started'

  return (
    <nav className={`bottom-nav${isDark ? ' bottom-nav--dark' : ''}`} aria-label="Primary">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `bottom-nav__tab${isActive ? ' is-active' : ''}`}
        >
          <span className="bottom-nav__icon"><Icon /></span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
