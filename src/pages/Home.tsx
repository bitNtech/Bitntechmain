import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { GlyphStack, GlyphChip } from '../components/icons/Glyphs'
import './Home.css'

// Keeps three.js out of the landing page's first paint. She fades in on her own
// once loaded, so an empty slot for a moment is the intended state.
const NilaHero = lazy(() => import('../components/robot/NilaHero'))

/* The three layers the studio works across, in the order they sit on the
   hero's signal: the line enters at the left as analog noise out of the
   physical world and leaves at the right as clean data, so hardware is the
   end it comes in at and software is the end it comes out of. */
const SPAN = ['Hardware', 'AI', 'Software']

/* The signal itself, drawn once at 1600x68 with the baseline at y=34: an
   unruly analog wave for the first 40% of the width, settling through a short
   transition into an even, deliberate pulse train. It is the studio's whole
   job in one line — a rough signal out of the real world, made into something
   exact — and the tagline sits on it. Stretched horizontally to whatever the
   viewport is; `vector-effect` keeps the stroke honest while it stretches. */
const SIGNAL = 'M0 34C24 34 30 16 52 16 74 16 78 48 100 48 122 48 128 20 152 20 176 20 180 46 202 46 224 46 230 12 256 12 282 12 286 50 310 50 334 50 338 18 362 18 386 18 390 44 412 44 434 44 440 22 464 22 488 22 492 46 516 46 540 46 546 24 570 25 594 26 600 38 622 36 640 34.5 652 34 668 34L700 34 700 14 760 14 760 34 822 34 822 14 850 14 850 34 920 34 920 14 1010 14 1010 34 1062 34 1062 14 1094 14 1094 34 1180 34 1180 14 1242 14 1242 34 1330 34 1330 14 1402 14 1402 34 1480 34 1480 14 1522 14 1522 34 1600 34'

const PATHS = [
  { num: '01', Icon: GlyphStack, title: 'Software', body: 'Digital systems people want to return to.', to: '/software' },
  { num: '02', Icon: GlyphChip, title: 'Hardware', body: 'Physical intelligence, from sensor to system.', to: '/hardware' },
] as const

const JOURNEY = [
  ['01', 'Discover', 'Map the problem, the people and the opening worth building for.'],
  ['02', 'Design', 'Give every moving part a job — from the interface to the architecture.'],
  ['03', 'Engineer', 'Bring software, AI and hardware into one deliberate system.'],
  ['04', 'Test', 'Put it in real conditions, learn fast and tune what matters.'],
  ['05', 'Deploy', 'Launch with an eye on the next version, not just today.'],
] as const

const INDUSTRIES = ['Healthcare', 'Agriculture', 'Manufacturing', 'Education', 'Startups', 'SMBs', 'Security']

export default function Home() {
  const pageRef = useRef<HTMLElement>(null)
  const processRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const worldsTrackRef = useRef<HTMLDivElement>(null)
  const worldsThumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    /* The tagline's own entrance is CSS — it animates the font's width and
       weight axes, which needs no JS and cannot be knocked out of step with a
       scroll listener. Everything below is the rest of the page. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      animate(entry.target.querySelectorAll('.reveal'), { opacity: [0, 1], translateY: [34, 0], rotateX: [-14, 0], delay: stagger(85), duration: 720, ease: 'out(4)' })
      observer.unobserve(entry.target)
    }), { threshold: 0.16 })
    page.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el))

    // The progress line begins at the top of the process list and fills as that
    // list passes the viewport midpoint. Each numbered box uses the same
    // progress value, so it begins forming when the line reaches it and
    // reverses naturally when the user scrolls back.
    const handleScroll = () => {
      if (!processRef.current || !lineRef.current) return
      const listWrap = processRef.current.querySelector<HTMLElement>('.home-process__list-wrap')
      if (!listWrap) return

      const rect = listWrap.getBoundingClientRect()
      const viewportMid = window.innerHeight * 0.5
      const totalScroll = rect.height
      const currentScroll = viewportMid - rect.top

      let progress = currentScroll / totalScroll
      progress = Math.max(0, Math.min(1, progress))

      lineRef.current.style.transform = `scaleY(${progress})`

      // Draw every numbered box in proportion to the amount of line that has
      // reached it. This is based on the box itself, not a fixed threshold.
      // Every rect is measured before anything is written: interleaving the two
      // forces the browser to re-run layout once per badge.
      const fillBottom = rect.top + totalScroll * progress
      const badges = processRef.current.querySelectorAll<HTMLElement>('.process-number')
      const badgeRects = Array.from(badges, (badge) => badge.getBoundingClientRect())
      badges.forEach((badge, index) => {
        const badgeRect = badgeRects[index]
        const badgeProgress = Math.max(0, Math.min(1, (fillBottom - badgeRect.top) / badgeRect.height))
        badge.style.setProperty('--process-box-progress', badgeProgress.toString())
        badge.parentElement?.classList.toggle('is-active', badgeProgress > 0)
      })
    }

    // Scroll fires far more often than the screen refreshes; coalescing to one
    // measure-and-paint per frame is what keeps the process list from stuttering.
    let scrollFrame = 0
    const onScroll = () => {
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        handleScroll()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    handleScroll()

    return () => {
      observer.disconnect()
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Custom scrollbar for the industries carousel: thumb width/position mirror
  // the track's native scroll, and the thumb itself is drag-scrollable.
  useEffect(() => {
    const trackEl = worldsTrackRef.current
    const thumbEl = worldsThumbRef.current
    if (!trackEl || !thumbEl) return

    const syncThumb = () => {
      const { scrollWidth, clientWidth, scrollLeft } = trackEl
      if (scrollWidth <= clientWidth) {
        thumbEl.style.width = '100%'
        thumbEl.style.transform = 'translateX(0)'
        return
      }
      const widthPct = clientWidth / scrollWidth
      const leftPct = scrollLeft / scrollWidth
      thumbEl.style.width = `${widthPct * 100}%`
      thumbEl.style.transform = `translateX(${(leftPct / widthPct) * 100}%)`
    }

    let dragStartX = 0
    let dragStartScroll = 0
    const onPointerMove = (event: PointerEvent) => {
      const barWidth = thumbEl.parentElement?.clientWidth ?? 1
      const scale = trackEl.scrollWidth / barWidth
      trackEl.scrollLeft = dragStartScroll + (event.clientX - dragStartX) * scale
    }
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
    const onPointerDown = (event: PointerEvent) => {
      dragStartX = event.clientX
      dragStartScroll = trackEl.scrollLeft
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    }

    syncThumb()
    trackEl.addEventListener('scroll', syncThumb, { passive: true })
    window.addEventListener('resize', syncThumb)
    thumbEl.addEventListener('pointerdown', onPointerDown)
    return () => {
      trackEl.removeEventListener('scroll', syncThumb)
      window.removeEventListener('resize', syncThumb)
      thumbEl.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  const scrollWorlds = (dir: 1 | -1) => {
    worldsTrackRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return <main className="home-experience" ref={pageRef}>
    <section className="home-hero">
      <div className="home-hero__inner">
        {/* Two registers, not three: a quiet lead-in, then the word itself at
            the full width of its column. The word is drawn as an outline and
            filled in from the left as the signal below it lands — the one
            thing in the hero that moves on its own, and the reason the type
            is set twice. Only the outline copy is read aloud. */}
        <h1 className="hero-head">
          <span className="hero-head__lead">Engineering the next</span>
          <span className="hero-head__word">
            <span className="hero-head__outline">Evolution</span>
            <span className="hero-head__fill" aria-hidden="true">Evolution</span>
          </span>
        </h1>

        <Suspense fallback={null}><NilaHero /></Suspense>

        <div className="hero-signal">
          <svg className="hero-signal__wave" viewBox="0 0 1600 68" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="heroSignal" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#9b7fbe" />
                <stop offset=".3" stopColor="#b2769b" />
                <stop offset=".44" stopColor="#ff6e42" />
                <stop offset="1" stopColor="#ff6e42" />
              </linearGradient>
            </defs>
            <path d={SIGNAL} pathLength="1" fill="none" stroke="url(#heroSignal)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
          <ul className="hero-signal__stops" aria-label="What we work across">
            {SPAN.map((layer) => <li key={layer}>{layer}</li>)}
          </ul>
        </div>

        <div className="hero-foot">
          <p className="hero-lede">
            One team, from the first sketch to the thing running in the real
            world.
          </p>
          <div className="hero-actions">
            <Link className="hero-cta" to="/contact">Start a project</Link>
            <a className="hero-quiet-cta" href="#solutions">See what we build</a>
          </div>
        </div>
      </div>
    </section>
    <section className="home-manifesto" data-reveal><p className="home-kicker reveal">The bitNtech approach</p><h2 className="reveal">Ideas gain momentum when <em>every layer</em> works together.</h2><div className="home-manifesto__footer reveal"><p>AI. Software. Hardware. One curious team, building things that are useful in the real world.</p><span>01 / 05</span></div></section>
    <section className="home-solutions" id="solutions" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Capabilities</p><h2>Choose your<br />launch point.</h2><p>Hover, tilt and pick a path into what we build.</p></div><div className="home-service-grid">{PATHS.map(({ num, Icon, title, body, to }) => <Link className="home-service reveal" key={num} to={to}><span className="home-service__number">{num}</span><Icon size={42} /><h3>{title}</h3><p>{body}</p><span className="home-service__arrow">↗</span></Link>)}</div></section>
    <section className="home-process" data-reveal ref={processRef}><div className="home-process__sticky"><p className="home-kicker reveal">From signal to system</p><h2 className="reveal">A process built to keep moving.</h2><p className="reveal">Scroll through the five moves that take a good question all the way to a working answer.</p></div><div className="home-process__list-wrap"><div className="home-process__line"><div className="home-process__line-progress" ref={lineRef} /></div><ol>{JOURNEY.map(([number, title, text]) => <li className="reveal" key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
    <section className="home-worlds" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Built for the real world</p><h2>Any industry.<br /><em>More possibility.</em></h2></div><div className="home-worlds__track reveal" ref={worldsTrackRef}>{INDUSTRIES.map((industry, index) => <div className="home-world" key={industry}><span>0{index + 1}</span><h3>{industry}</h3><i /></div>)}</div><div className="home-worlds__scrollbar reveal"><button type="button" aria-label="Scroll left" onClick={() => scrollWorlds(-1)}>‹</button><div className="home-worlds__scrollbar-track"><div className="home-worlds__scrollbar-thumb" ref={worldsThumbRef} /></div><button type="button" aria-label="Scroll right" onClick={() => scrollWorlds(1)}>›</button></div></section>
    <section className="home-closing" data-reveal><p className="home-kicker reveal">Make the next move</p><h2 className="reveal">Let’s make your idea <em>impossible to ignore.</em></h2><Link className="reveal" to="/contact">Tell us what you’re building <span>↗</span></Link></section>
  </main>
}
