import { Link } from 'react-router-dom'
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
      { label: 'LinkedIn', href: 'https://linkedin.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Email', href: 'mailto:care@bitntech.ai' },
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
  return (
    <footer className="site-footer">
      <div className="bubbles">
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
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
              ),
            )}
          </div>

          <div className="what-if">
            {WHAT_IF.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <p className="what-if-final">Let's build it.</p>
            <Link className="what-if-cta" to="/contact">Start a Project</Link>
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

      <svg style={{ position: 'fixed', top: '100vh' }}>
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
