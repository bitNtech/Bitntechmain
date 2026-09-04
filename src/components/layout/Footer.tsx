import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONTACT } from '../../contact'
import './Footer.css'

const BUBBLE_COUNT = 60

const WHAT_IF = [
  'What if your idea wasn’t just an idea?',
  'What if it could move?',
  'What if it could see?',
  'What if it could think?',
  'What if it could scale?',
]

const NAV_COLUMNS = [
  {
    heading: 'BitNtech',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Solutions', href: '/#solutions' },
      { label: 'Industries', href: '/#industries' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'LinkedIn', href: CONTACT.linkedin.url },
      { label: 'Instagram', href: CONTACT.instagram.url },
      { label: 'GitHub', href: CONTACT.github.url },
      { label: 'Email', href: CONTACT.emailHref },
      { label: CONTACT.phone, href: CONTACT.phoneHref },
    ],
  },
] as const

const bubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
  key: i,
  size: 2 + Math.random() * 4,
  distance: 6 + Math.random() * 4,
  position: -5 + Math.random() * 110,
  time: 2 + Math.random() * 2,
  delay: -1 * (2 + Math.random() * 2),
}))

export default function Footer() {
  /* Same reason as the nav's CTA: on the contact page this link goes nowhere
     new, so the closing statement stands on its own. */
  const { pathname } = useLocation()
  const onContact = pathname === '/contact' || pathname === '/get-started'

  /* Sixty circles under an SVG gaussian filter is the most expensive paint on
     the site, and the footer is below the fold on every page — so for almost
     the whole visit the browser was re-running that filter for something
     nobody could see. The class parks the animations; see Footer.css. */
  const bubblesRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = bubblesRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-paused', !entry.isIntersecting),
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <footer className="site-footer">
      <div className="bubbles is-paused" ref={bubblesRef}>
        {bubbles.map((b) => (
          <div
            className="bubble"
            key={b.key}
            style={
              {
                '--size': `${b.size}rem`,
                '--distance': `${b.distance}rem`,
                '--position': `${b.position}%`,
                '--time': `${b.time}s`,
                '--delay': `${b.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="content">
        <div className="footer-grid">
          <div className="columns">
            <b>{NAV_COLUMNS[0].heading}</b>
            {NAV_COLUMNS[0].links.map((link) =>
              'to' in link ? (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ) : (
                /* /#solutions and /#industries are this site — sending them
                   through the external branch opened the homepage in a new
                   tab. Only an off-site URL gets target/rel. */
                <a key={link.label} href={link.href}>{link.label}</a>
              ),
            )}
          </div>

          <div className="what-if">
            {WHAT_IF.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="what-if-final">Engineering the next Evolution.</p>
            {!onContact && <Link className="what-if-cta" to="/contact">Start a Project</Link>}
            <hr className="what-if-divider" />
          </div>

          <div className="columns">
            <b>{NAV_COLUMNS[1].heading}</b>
            {/* Every link in this column is external, so there is no router
                branch to take here. */}
            {NAV_COLUMNS[1].links.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            ))}
          </div>
        </div>

        <div className="brand-watermark" aria-hidden="true">BitN<em>Tech</em></div>
      </div>

      {/* Filter definition only. It was `position: fixed` at top: 100vh, which
          promoted a permanently off-screen layer the compositor carried on
          every scroll; a zero-sized absolute box costs nothing. */}
      <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="blob">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob" />
          </filter>
        </defs>
      </svg>
    </footer>
  )
}
