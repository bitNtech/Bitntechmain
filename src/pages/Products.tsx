import { Link } from 'react-router-dom'
import { PRODUCTS, type Product, type ProductCta } from '../data/products'
import './Products.css'

/**
 * The product catalogue. Everything on a card comes from `data/products.ts`;
 * this file only decides how a record looks.
 *
 * The product visuals are drawn, not photographed. There is no approved
 * product photography yet, and a rendered "photo" of a card would read as a
 * manufactured BitNTech product — so each one is an honest illustration,
 * labelled as such to assistive tech. Swap `ProductVisual` for real imagery
 * when it exists.
 */

export function ProductVisual({ product }: { product: Pick<Product, 'visual' | 'shortName'> }) {
  if (product.visual === 'aica') {
    return (
      <svg className="pd-visual pd-visual--aica" viewBox="0 0 400 250" role="img" aria-label="Illustration of a voice waveform for AICA, the AI caller agent">
        <circle className="pd-ring" cx="200" cy="125" r="96" />
        <circle className="pd-ring pd-ring--2" cx="200" cy="125" r="68" />
        <circle className="pd-core" cx="200" cy="125" r="40" />
        {/* A waveform: bar heights are fixed, the pulse is CSS. */}
        {[18, 34, 52, 30, 64, 42, 24, 56, 36, 20, 44, 28].map((h, i) => (
          <rect
            key={i}
            className="pd-bar"
            x={110 + i * 15.5}
            y={125 - h / 2}
            width="6"
            height={h}
            rx="3"
            style={{ '--i': i } as React.CSSProperties}
          />
        ))}
      </svg>
    )
  }
  if (product.visual === 'card') {
    return (
      <svg className="pd-visual pd-visual--card" viewBox="0 0 400 250" role="img" aria-label="Illustration of a black NFC business card beside a smartphone">
        <defs>
          <linearGradient id="pd-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a2a2e" />
            <stop offset=".55" stopColor="#141416" />
            <stop offset="1" stopColor="#3a3a40" />
          </linearGradient>
        </defs>
        <g transform="rotate(-8 170 130)">
          <rect x="60" y="62" width="210" height="132" rx="12" fill="url(#pd-metal)" stroke="rgba(255,255,255,.18)" />
          <text x="80" y="96" className="pd-card-word">BitN<tspan fill="#ff6e42">Tech</tspan></text>
          <rect x="80" y="150" width="70" height="5" rx="2.5" fill="rgba(255,255,255,.35)" />
          <rect x="80" y="163" width="48" height="5" rx="2.5" fill="rgba(255,255,255,.2)" />
          {/* NFC mark: three arcs. */}
          <g fill="none" stroke="#ff6e42" strokeWidth="3" strokeLinecap="round">
            <path d="M232 118 a10 10 0 0 1 0 20" />
            <path d="M240 110 a20 20 0 0 1 0 36" />
            <path d="M248 102 a30 30 0 0 1 0 52" />
          </g>
        </g>
        <rect x="270" y="56" width="78" height="150" rx="14" fill="#0c0c0e" stroke="rgba(255,255,255,.28)" />
        <rect x="278" y="70" width="62" height="122" rx="6" fill="rgba(255,110,66,.10)" />
        <circle cx="309" cy="104" r="14" fill="rgba(255,255,255,.18)" />
        <rect x="290" y="128" width="38" height="4" rx="2" fill="rgba(255,255,255,.4)" />
        <rect x="294" y="138" width="30" height="4" rx="2" fill="rgba(255,255,255,.22)" />
        <rect x="288" y="158" width="42" height="12" rx="6" fill="#ff6e42" />
      </svg>
    )
  }
  return (
    <svg className="pd-visual pd-visual--vidya" viewBox="0 0 400 250" role="img" aria-label={`${product.shortName}, coming soon`}>
      <path className="pd-vidya-v" d="M150 70 L200 180 L250 70" />
      <text x="200" y="215" textAnchor="middle" className="pd-vidya-word">{product.shortName}</text>
    </svg>
  )
}

function Cta({ cta, variant }: { cta: ProductCta; variant: 'primary' | 'secondary' }) {
  const className = `pd-btn pd-btn--${variant}`
  if (cta.external) {
    return (
      <a className={className} href={cta.href} target="_blank" rel="noopener noreferrer">
        {cta.label}
        <span aria-hidden="true"> ↗</span>
        <span className="pd-sr"> (opens in a new tab)</span>
      </a>
    )
  }
  return <Link className={className} to={cta.href}>{cta.label}</Link>
}

export function ProductCard({ product }: { product: Product }) {
  const soon = product.status === 'coming-soon'
  return (
    <article className={`pd-card${soon ? ' pd-card--soon' : ''}`} aria-labelledby={`pd-${product.id}`}>
      <div className="pd-card__media">
        <ProductVisual product={product} />
        <span className={`pd-status pd-status--${product.status}`}>{product.statusLabel}</span>
      </div>
      <div className="pd-card__body">
        <p className="pd-label">{product.category}</p>
        <h2 id={`pd-${product.id}`} className="pd-card__name">{product.name}</h2>
        <p className="pd-card__summary">{product.summary}</p>
        {product.features.length > 0 && (
          <ul className="pd-features">
            {product.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
        {(product.primary || product.secondary) && (
          <div className="pd-card__ctas">
            {product.primary && <Cta cta={product.primary} variant="primary" />}
            {product.secondary && <Cta cta={product.secondary} variant="secondary" />}
          </div>
        )}
      </div>
    </article>
  )
}

export default function Products() {
  return (
    /* The ground is on the inner div, not <main>: main fades in on every route,
       and the navbar's ground probe skips translucent layers — it fell through
       to the cream #root and drew the wordmark dark on dark. */
    <main id="main"><div className="pd">
      <header className="pd-hero">
        <p className="pd-label">BitNTech <i>/</i> Products</p>
        <h1 className="pd-title">Our Products</h1>
        <p className="pd-tagline">Intelligent Products. Engineered for Impact.</p>
        <p className="pd-lead">
          Alongside client engineering, BitNTech builds its own products: intelligent
          software and customized technology solutions designed to do one job well
          for the businesses and people who use them.
        </p>
      </header>

      <section className="pd-grid" aria-label="Product catalogue">
        {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
      </section>

      <section className="pd-closing">
        <h2>Need something built around your business?</h2>
        <p>Every product here started as an engineering problem. Tell us yours.</p>
        <Link className="pd-btn pd-btn--primary" to="/contact">Start a Project</Link>
      </section>
    </div></main>
  )
}
