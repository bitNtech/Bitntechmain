import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCTS, type Product, type ProductCta, type ProductVideo } from '../data/products'
import './Products.css'

/**
 * The product catalogue, staged: one product to a screen, each set against
 * its own giant word with its visual floating in front of it and a details
 * panel on the right that moves through its slides by itself. The stages are
 * sticky, so scrolling lifts the next product over the last one, and one
 * flick of the wheel — or one swipe on a phone — glides exactly one product.
 * Everything on a stage comes from `data/products.ts`.
 *
 * The product visuals are drawn, not photographed — except AICA's, which is
 * lifted from its own launch film. A rendered "photo" of a card would read as
 * a manufactured BitNTech product, so the others stay honest illustrations.
 *
 * All motion is CSS, keyed off `.is-active` on the stage on screen, and off
 * under reduced motion; the slideshow also never advances by itself there.
 */

export function ProductVisual({ product }: { product: Pick<Product, 'visual' | 'shortName'> }) {
  if (product.visual === 'aica') {
    return (
      <svg className="pd-visual pd-visual--aica" viewBox="0 0 400 250" role="img" aria-label="Illustration of a voice waveform for AICA, the AI caller agent">
        {/* Rings that keep leaving the centre, like a voice carrying. */}
        <circle className="pd-ripple" cx="200" cy="125" r="40" />
        <circle className="pd-ripple pd-ripple--2" cx="200" cy="125" r="40" />
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
      <svg className="pd-visual pd-visual--card" viewBox="0 0 400 250" role="img" aria-label="Illustration of a black NFC business card being tapped on a smartphone">
        <defs>
          <linearGradient id="pd-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a2a2e" />
            <stop offset=".55" stopColor="#141416" />
            <stop offset="1" stopColor="#3a3a40" />
          </linearGradient>
          <linearGradient id="pd-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="pd-card-clip">
            <rect x="60" y="62" width="210" height="132" rx="12" />
          </clipPath>
        </defs>
        {/* The tap: this group slides toward the phone and back. */}
        <g className="pd-tap">
          <g transform="rotate(-8 170 130)">
            <rect x="60" y="62" width="210" height="132" rx="12" fill="url(#pd-metal)" stroke="rgba(255,255,255,.18)" />
            {/* A sheen that crosses the card now and then. */}
            <g clipPath="url(#pd-card-clip)">
              <rect className="pd-sheen" x="-40" y="40" width="70" height="180" fill="url(#pd-sheen)" />
            </g>
            <text x="80" y="96" className="pd-card-word">BitN<tspan fill="#ff6e42">Tech</tspan></text>
            <rect x="80" y="150" width="70" height="5" rx="2.5" fill="rgba(255,255,255,.35)" />
            <rect x="80" y="163" width="48" height="5" rx="2.5" fill="rgba(255,255,255,.2)" />
            {/* NFC mark: three arcs, lit one after another. */}
            <g fill="none" stroke="#ff6e42" strokeWidth="3" strokeLinecap="round">
              <path className="pd-arc" style={{ '--i': 0 } as React.CSSProperties} d="M232 118 a10 10 0 0 1 0 20" />
              <path className="pd-arc" style={{ '--i': 1 } as React.CSSProperties} d="M240 110 a20 20 0 0 1 0 36" />
              <path className="pd-arc" style={{ '--i': 2 } as React.CSSProperties} d="M248 102 a30 30 0 0 1 0 52" />
            </g>
          </g>
        </g>
        <rect x="270" y="56" width="78" height="150" rx="14" fill="#0c0c0e" stroke="rgba(255,255,255,.28)" />
        <rect className="pd-screen" x="278" y="70" width="62" height="122" rx="6" />
        <circle cx="309" cy="104" r="14" fill="rgba(255,255,255,.18)" />
        <rect x="290" y="128" width="38" height="4" rx="2" fill="rgba(255,255,255,.4)" />
        <rect x="294" y="138" width="30" height="4" rx="2" fill="rgba(255,255,255,.22)" />
        <rect x="288" y="158" width="42" height="12" rx="6" fill="#ff6e42" />
      </svg>
    )
  }
  return (
    <svg className="pd-visual pd-visual--vidya" viewBox="0 0 400 250" role="img" aria-label={`${product.shortName}, coming soon`}>
      <defs>
        <linearGradient id="pd-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6e42" stopOpacity="0" />
          <stop offset=".9" stopColor="#ff6e42" stopOpacity=".22" />
          <stop offset="1" stopColor="#ff6e42" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <path className="pd-vidya-v" d="M150 70 L200 180 L250 70" pathLength="1" />
      <text x="200" y="215" textAnchor="middle" className="pd-vidya-word">{product.shortName}</text>
      {/* Still under wraps: a scan line keeps passing over it. */}
      <rect className="pd-scan" x="0" y="-60" width="400" height="60" fill="url(#pd-scan)" />
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

/** How long each detail slide stays up before the panel moves on. */
const SLIDE_MS = 5200

type Slide = { label: string; body: React.ReactNode }

function slidesFor(p: Product): Slide[] {
  if (p.status === 'coming-soon') {
    return [{
      label: 'Status',
      body: (
        <>
          <p className="pd-slide__lead">{p.summary}</p>
          {/* Decorative only: nothing is claimed about an unreleased product. */}
          <div className="pd-redacted" aria-hidden="true"><i /><i /><i /></div>
        </>
      ),
    }]
  }
  const slides: Slide[] = [{
    label: 'Overview',
    body: (
      <>
        {p.tagline && <p className="pd-slide__tagline">{p.tagline}</p>}
        <p className="pd-slide__lead">{p.summary}</p>
      </>
    ),
  }]
  if (p.features.length) {
    slides.push({
      label: 'What it does',
      body: (
        <ol className="pd-slide__list">
          {p.features.map((f, i) => <li key={f}><b>{String(i + 1).padStart(2, '0')}</b>{f}</li>)}
        </ol>
      ),
    })
  }
  if (p.highlights?.length) {
    slides.push({
      label: 'At a glance',
      body: (
        <dl className="pd-slide__facts">
          {p.highlights.map((h) => <div key={h.label}><dt>{h.label}</dt><dd>{h.value}</dd></div>)}
        </dl>
      ),
    })
  }
  return slides
}

/**
 * The details panel: a horizontal carousel that always travels right to left.
 * Each slide sits at its place relative to the current one — on screen, one
 * width to the right (next), or one width to the left (previous) — so moving
 * on slides the next in from the right and pushes the current out to the
 * left, wrap-around included. A slide that has to cross from the far left to
 * the far right does it without a transition, off screen, so nothing ever
 * sweeps backwards across the panel.
 *
 * It moves on by itself while its stage is on screen, and it can be dragged
 * or swiped. Hovering, focusing or dragging holds it; the pause button stops
 * it outright, since anything that moves on its own has to be stoppable.
 * Under reduced motion it never advances by itself.
 */
function Slides({ slides, running, id }: { slides: Slide[]; running: boolean; id: string }) {
  const n = slides.length
  // The previous slide is kept too, so a slide can tell it has wrapped round.
  const [{ index, prev }, setPos] = useState({ index: 0, prev: 0 })
  const [held, setHeld] = useState(false)
  const [stopped, setStopped] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [drag, setDrag] = useState<number | null>(null)
  const dragStart = useRef<{ x: number; y: number; id: number; horizontal: boolean | null } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const moving = running && !held && !stopped && drag === null && n > 1

  const go = (next: number) => setPos((p) => ({ index: ((next % n) + n) % n, prev: p.index }))

  useEffect(() => {
    if (!moving) return
    // Restarts on every change of slide, so a manual pick gets a full beat.
    const t = window.setTimeout(() => setPos((p) => ({ index: (p.index + 1) % n, prev: p.index })), SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [moving, index, n])

  /* -1 left, 0 on screen, 1 right. With two slides the other one is always
     "next", so it always comes in from the right. */
  const offsetFrom = (current: number) => (k: number) => {
    const rel = (k - current + n) % n
    if (rel === 0) return 0
    return rel === n - 1 && n > 2 ? -1 : 1
  }
  const offsets = slides.map((_, k) => offsetFrom(index)(k))
  const before = slides.map((_, k) => offsetFrom(prev)(k))

  const onPointerDown = (e: React.PointerEvent) => {
    if (n < 2 || (e.target as Element).closest('a, button')) return
    dragStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId, horizontal: null }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = dragStart.current
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    // Decide once whether this is a swipe or the page being scrolled.
    if (s.horizontal === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      s.horizontal = Math.abs(dx) > Math.abs(dy)
      if (!s.horizontal) { dragStart.current = null; return }
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setDrag(dx)
  }
  const endDrag = (e: React.PointerEvent) => {
    const s = dragStart.current
    dragStart.current = null
    if (!s || s.id !== e.pointerId || drag === null) { setDrag(null); return }
    const width = viewportRef.current?.offsetWidth ?? 300
    const threshold = Math.min(70, width * 0.18)
    if (drag < -threshold) go(index + 1)
    else if (drag > threshold) go(index - 1)
    setDrag(null)
  }

  return (
    <div
      className={`pd-slides${moving ? ' is-moving' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Product details"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false) }}
    >
      <div
        ref={viewportRef}
        className={`pd-slides__viewport${drag !== null ? ' is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="pd-slides__track">
          {slides.map((s, k) => {
            const jump = Math.abs(offsets[k] - before[k]) > 1
            return (
              <div
                key={s.label}
                id={`${id}-slide-${k}`}
                className={`pd-slide${k === index ? ' is-current' : ''}${jump ? ' is-jumping' : ''}`}
                style={{ '--off': offsets[k], '--drag': `${drag ?? 0}px` } as React.CSSProperties}
                role="group"
                aria-roledescription="slide"
                aria-label={`${k + 1} of ${n}: ${s.label}`}
                aria-hidden={k !== index}
                inert={k !== index}
              >
                <p className="pd-slide__label">{s.label}</p>
                {s.body}
              </div>
            )
          })}
        </div>
      </div>

      {n > 1 && (
        <div className="pd-slides__nav">
          {slides.map((s, k) => (
            <button
              key={s.label}
              type="button"
              className={`pd-slides__dot${k === index ? ' is-current' : ''}`}
              aria-label={`Show ${s.label}`}
              aria-controls={`${id}-slide-${k}`}
              aria-current={k === index}
              onClick={() => go(k)}
            >
              {/* Fills over the slide's time on screen; restarts per slide. */}
              <i key={k === index ? `${index}-${moving}` : k} style={{ animationDuration: `${SLIDE_MS}ms` }} />
            </button>
          ))}
          <button
            type="button"
            className="pd-slides__pause"
            aria-label={stopped ? 'Play the details slideshow' : 'Pause the details slideshow'}
            onClick={() => setStopped((v) => !v)}
          >
            {stopped
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>}
          </button>
        </div>
      )}
    </div>
  )
}

/** The AICA orb, lifted out of its own film, with the way into the film under it. */
function FilmVisual({ product, onPlay }: { product: Product; onPlay: () => void }) {
  const video = product.video!
  return (
    <div className="pd-orb">
      <span className="pd-orb__ring" aria-hidden="true" />
      <span className="pd-orb__ring pd-orb__ring--2" aria-hidden="true" />
      <img className="pd-orb__img" src={video.poster} alt="" width="1280" height="720" decoding="async" />
      <button type="button" className="pd-orb__play" onClick={onPlay}>
        <span className="pd-orb__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
        <span>See what {product.shortName} can do</span>
        <em>{clock(video.duration)}</em>
        <span className="pd-sr"> — plays the film, with sound</span>
      </button>
    </div>
  )
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function ProductStage({ product, index, total, active, onPlay }: {
  product: Product
  index: number
  total: number
  active: boolean
  onPlay: () => void
}) {
  const soon = product.status === 'coming-soon'
  return (
    <section
      id={`product-${product.id}`}
      className={`pd-stage pd-stage--${product.visual}${active ? ' is-active' : ''}`}
      aria-labelledby={`pd-${product.id}`}
    >
      <div className="pd-stage__inner">
        <p className="pd-stage__count" aria-hidden="true">
          {String(index + 1).padStart(2, '0')} <i>/ {String(total).padStart(2, '0')}</i>
        </p>

        {/* The giant word the product is set against. One span per letter so
            they can rise in turn. */}
        <p className="pd-stage__word" aria-hidden="true">
          {product.bigWord.split('').map((ch, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}><span>{ch}</span></span>
          ))}
          {/* The contactless mark, at letter size, rising as the last letter. */}
          {product.bigGlyph === 'nfc' && (
            <span style={{ '--i': product.bigWord.length } as React.CSSProperties}>
              <span className="pd-stage__glyph">
                <svg viewBox="0 0 60 100">
                  <path d="M8 34a22 22 0 0 1 0 32" />
                  <path d="M22 20a40 40 0 0 1 0 60" />
                  <path d="M36 6a58 58 0 0 1 0 88" />
                </svg>
              </span>
            </span>
          )}
        </p>

        <div className="pd-stage__visual">
          {product.video ? <FilmVisual product={product} onPlay={onPlay} /> : <ProductVisual product={product} />}
          <span className="pd-stage__shadow" aria-hidden="true" />
        </div>

        <p className="pd-stage__note"><i aria-hidden="true" />{product.category}</p>

        <div className="pd-stage__panel" data-nila={product.nila}>
          {/* Only where the status says something the page does not: a custom
              job, or not out yet. "Available" went without saying. */}
          {product.status !== 'available' && (
            <p className={`pd-stage__status pd-stage__status--${product.status}`}>{product.statusLabel}</p>
          )}
          <h2 id={`pd-${product.id}`} className="pd-stage__name">{product.name}</h2>
          <Slides slides={slidesFor(product)} running={active} id={product.id} />
          {!soon && (product.primary || product.secondary) && (
            <div className="pd-card__ctas">
              {product.primary && <Cta cta={product.primary} variant="primary" />}
              {product.secondary && <Cta cta={product.secondary} variant="secondary" />}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** The film, full screen, on the native <dialog>: focus is trapped and Esc closes it for free. */
function FilmDialog({ video, open, onClose }: { video: ProductVideo; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const d = dialogRef.current
    const v = videoRef.current
    if (!d || !v) return
    if (open) {
      if (!d.open) d.showModal()
      void v.play()
    } else {
      v.pause()
      if (d.open) d.close()
    }
  }, [open])
  return (
    <dialog
      ref={dialogRef}
      className="pd-film-dialog"
      aria-label={video.title}
      onClose={onClose}
      // A click on the dimmed backdrop lands on the dialog itself.
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="pd-film-dialog__frame">
        <video ref={videoRef} src={video.src} poster={video.poster} preload="none" playsInline controls title={video.title}>
          <track kind="captions" src={video.captions} srcLang="en" label="English" default />
        </video>
      </div>
      <button type="button" className="pd-film-dialog__close" onClick={onClose} aria-label="Close the film">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </dialog>
  )
}

export default function Products() {
  const stagesRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const [filmOpen, setFilmOpen] = useState(false)
  const filmProduct = PRODUCTS.find((p) => p.video)

  /* One flick, one product. A wheel gesture, a paging key or a swipe inside
     the stages glides to the next (or previous) product instead of scrolling
     an arbitrary distance. Below the last product, above the first, on
     screens too short for a stage to fit (Products.css) and under reduced
     motion, scrolling is the browser's own.

     A trackpad keeps firing wheel events for a second after the fingers
     lift, each a little weaker than the last. Those are swallowed — during
     the glide, after it until the wheel has been quiet for a moment, and any
     event that is weaker than the one before it — or one swipe would skip a
     product. A fresh gesture starts strong again, and that is what moves. */
  useEffect(() => {
    const wrap = stagesRef.current
    if (!wrap) return
    // Mirrors the media queries in Products.css that make the stages sticky.
    const stacked = window.matchMedia('(min-width: 861px), (min-height: 640px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stages = [...wrap.querySelectorAll<HTMLElement>('.pd-stage')]
    const GLIDE_MS = 1000
    const QUIET_MS = 220
    let gliding = false
    let lockUntil = 0
    let frame = 0
    let lastWheel = { at: 0, size: 0 }
    // Whether the gesture now running was taken over; its momentum goes with it.
    let owned = false

    /* Stage tops from flow heights: they are sticky, so their own boxes
       report where they are stuck, not where they sit in the page. */
    const tops = () => {
      let y = wrap.getBoundingClientRect().top + window.scrollY
      return stages.map((s) => {
        const top = y
        y += s.offsetHeight
        return Math.round(top)
      })
    }

    const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
    // A released finger is already moving, so a touch glide only decelerates.
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)
    const glideTo = (target: number, ms = GLIDE_MS, curve = ease) => {
      const from = window.scrollY
      const distance = target - from
      const t0 = performance.now()
      gliding = true
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms)
        // 'instant': :root has scroll-behavior smooth, which would fight every frame.
        window.scrollTo({ top: from + distance * curve(p), behavior: 'instant' })
        if (p < 1) frame = requestAnimationFrame(step)
        else {
          gliding = false
          lockUntil = performance.now() + QUIET_MS
        }
      }
      frame = requestAnimationFrame(step)
    }

    /** Where one step in `dir` goes from here, or null to leave it to the browser. */
    const targetFor = (dir: number): number | null => {
      const y = window.scrollY
      const t = tops()
      const first = t[0]
      const last = t[t.length - 1]
      const vh = window.innerHeight
      if (dir > 0) {
        if (y >= last - 2) return null
        return t.find((top) => top > y + 2) ?? null
      }
      if (y <= 2 || y > last + vh) return null
      if (y > last + 2) return last
      if (y <= first + 2) return 0
      return [...t].reverse().find((top) => top < y - 2) ?? 0
    }

    const enabled = () =>
      stacked.matches && !reduced.matches && !document.querySelector('dialog[open]')

    const step = (dir: number, e: Event): boolean => {
      if (!enabled()) return false
      const target = targetFor(dir)
      if (target === null) return false
      e.preventDefault()
      const now = performance.now()
      if (gliding || now < lockUntil) {
        lockUntil = Math.max(lockUntil, now + QUIET_MS)
        return true
      }
      glideTo(target)
      return true
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 2) return
      /* The event's own timestamp, not the clock now: it says when the wheel
         actually moved, so a busy frame that delivers a burst late cannot
         make the tail of one swipe look like the start of another. */
      const now = e.timeStamp
      const size = Math.abs(e.deltaY)
      // Momentum: close behind the last event and no stronger than it.
      const momentum = now - lastWheel.at < 450 && size <= lastWheel.size
      lastWheel = { at: now, size }
      if (momentum) {
        if (owned) e.preventDefault()
        return
      }
      owned = step(Math.sign(e.deltaY), e)
    }
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.altKey || e.ctrlKey || e.metaKey || el.closest('input, textarea, select, [contenteditable="true"]')) return
      const down = e.key === 'PageDown' || e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey && el.tagName !== 'BUTTON' && el.tagName !== 'A')
      const up = e.key === 'PageUp' || e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey)
      if (down) step(1, e)
      else if (up) step(-1, e)
    }

    /* Phones: the same glide, by finger. Between this product and the next
       the page follows the finger, so the next sheet rises with it; on release
       it glides the rest of the way, or back if the swipe was too short and
       too slow to mean it. A sideways swipe is left to the details carousel. */
    let touch: { x: number; y: number; at: number; from: number; dir: number; target: number } | null = null
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touch = e.touches.length === 1 && !(e.target as Element).closest('.nila-companion, .nila-dock')
        ? { x: t.clientX, y: t.clientY, at: e.timeStamp, from: window.scrollY, dir: 0, target: 0 }
        : null
    }
    const onTouchMove = (e: TouchEvent) => {
      if (gliding && e.cancelable) { e.preventDefault(); return }
      if (!touch) return
      const dx = touch.x - e.touches[0].clientX
      const dy = touch.y - e.touches[0].clientY
      if (!touch.dir) {
        if (!dy || Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 8) touch = null
          return
        }
        const target = e.cancelable && enabled() ? targetFor(Math.sign(dy)) : null
        if (target === null) { touch = null; return }
        touch.dir = Math.sign(dy)
        touch.target = target
      }
      e.preventDefault()
      const lo = Math.min(touch.from, touch.target)
      const hi = Math.max(touch.from, touch.target)
      window.scrollTo({ top: Math.min(hi, Math.max(lo, touch.from + dy)), behavior: 'instant' })
    }
    const onTouchEnd = (e: TouchEvent) => {
      const s = touch
      touch = null
      if (!s?.dir) return
      const moved = (window.scrollY - s.from) * s.dir
      const speed = moved / Math.max(1, e.timeStamp - s.at)
      const to = moved > Math.min(90, window.innerHeight * 0.15) || speed > 0.35 ? s.target : s.from
      glideTo(to, Math.max(320, (750 * Math.abs(to - window.scrollY)) / window.innerHeight), easeOut)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      cancelAnimationFrame(frame)
    }
  }, [])

  /* Which stage is on screen, and how far each one has been covered by the
     next. The stages are sticky, so they are measured by where the one after
     them is: as it rises from the bottom of the screen to the top, the one
     underneath recedes. One rAF-throttled pass per scroll. */
  useEffect(() => {
    const wrap = stagesRef.current
    if (!wrap) return
    const stages = [...wrap.querySelectorAll<HTMLElement>('.pd-stage')]
    let frame = 0
    const measure = () => {
      frame = 0
      const vh = window.innerHeight
      let current = -1
      stages.forEach((stage, i) => {
        const top = stage.getBoundingClientRect().top
        if (top <= vh * 0.5) current = i
        const next = stages[i + 1]
        const leave = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh)) : 0
        stage.style.setProperty('--leave', leave.toFixed(3))
      })
      // Past the last stage's own height, nothing is on stage any more.
      const last = stages[stages.length - 1]
      if (last && last.getBoundingClientRect().bottom < vh * 0.4) current = -1
      setActive(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    /* The ground is on the inner div, not <main>: main fades in on every route,
       and the navbar's ground probe skips translucent layers — it fell through
       to the cream #root and drew the wordmark dark on dark. */
    <main id="main"><div className="pd pd--stages">
      <header className="pd-intro">
        <div className="pd-backdrop" aria-hidden="true"><i /><i /></div>
        <div className="pd-intro__wrap">
        <p className="pd-label pd-in" style={{ '--i': 0 } as React.CSSProperties}>BitNTech <i>/</i> Products</p>
        <h1 className="pd-title">
          <span className="pd-in pd-title__ghost" style={{ '--i': 1 } as React.CSSProperties}>Our</span>{' '}
          <span className="pd-in" style={{ '--i': 2 } as React.CSSProperties}>Products</span>
        </h1>
        <p className="pd-tagline pd-in" style={{ '--i': 3 } as React.CSSProperties}>
          Intelligent Products. <em>Engineered for Impact.</em>
        </p>
        <p className="pd-lead pd-in" style={{ '--i': 4 } as React.CSSProperties}>
          Alongside client engineering, BitNTech builds its own products: intelligent
          software and customized technology solutions designed to do one job well
          for the businesses and people who use them.
        </p>
        <a className="pd-cue pd-in" style={{ '--i': 5 } as React.CSSProperties} href={`#product-${PRODUCTS[0].id}`}>
          <span>Scroll to explore</span>
          <i aria-hidden="true" />
        </a>
        </div>
      </header>

      {/* Which product is on stage, and a way to jump between them. */}
      <nav className={`pd-rail${active >= 0 ? ' is-on' : ''}`} aria-label="Products">
        <ol>
          {PRODUCTS.map((p, i) => (
            <li key={p.id}>
              <a href={`#product-${p.id}`} aria-current={i === active ? 'true' : undefined} className={i === active ? 'is-current' : ''}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <i aria-hidden="true" />
                <span>{p.shortName}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="pd-stages" ref={stagesRef}>
        {PRODUCTS.map((p, i) => (
          <ProductStage
            key={p.id}
            product={p}
            index={i}
            total={PRODUCTS.length}
            active={i === active}
            onPlay={() => setFilmOpen(true)}
          />
        ))}
      </div>

      {/* The film's narration, for anyone who cannot or would rather not
          watch it. Outside the stages:
          they are fixed-height and stacked, and would cover it when open. */}
      {filmProduct?.video && (
        <details className="pd-transcript">
          <summary>{filmProduct.video.title}: read the film</summary>
          {filmProduct.video.transcript.map((line) => <p key={line}>{line}</p>)}
        </details>
      )}

      <section className="pd-closing">
        <p className="pd-label">Custom builds</p>
        <h2>Need something built around your business?</h2>
        <p>Every product here started as an engineering problem. Tell us yours.</p>
        <Link className="pd-btn pd-btn--primary" to="/contact">Start a Project <span aria-hidden="true">→</span></Link>
      </section>

      {filmProduct?.video && <FilmDialog video={filmProduct.video} open={filmOpen} onClose={() => setFilmOpen(false)} />}
    </div></main>
  )
}
