import { Link } from 'react-router-dom'
import './Products.css'

/**
 * Any URL no route claims. The host serves dist/404.html with a real 404
 * status (see scripts/seo-build.ts), and this is what that page renders, so a
 * mistyped link gets a way back instead of the home page under a wrong address.
 */
export default function NotFound() {
  return (
    <main id="main"><div className="pd">
      <header className="pd-hero">
        <p className="pd-label">Error 404</p>
        <h1 className="pd-title">Page not found.</h1>
        <p className="pd-lead">
          This address does not lead anywhere on BitNTech. It may have moved, or the
          link may have a typo. These are the main sections of the site:
        </p>
        <ul className="pd-lead">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/software">Software &amp; AI development services</Link></li>
          <li><Link to="/hardware">Robotics, IoT &amp; embedded hardware engineering</Link></li>
          <li><Link to="/products">Products: AICA, Smart Business Card, VIDYA</Link></li>
          <li><Link to="/about">About the team</Link></li>
        </ul>
        <div className="pd-card__ctas">
          <Link className="pd-btn pd-btn--primary" to="/contact">Contact BitNTech</Link>
        </div>
      </header>
    </div></main>
  )
}
