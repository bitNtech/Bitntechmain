import { Fragment, Suspense, lazy, useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { GlyphStack, GlyphChip } from '../components/icons/Glyphs'
import './Home.css'

// Keeps three.js out of the landing page's first paint. She fades in on her own
// once loaded, so an empty slot for a moment is the intended state.
const NilaHero = lazy(() => import('../components/robot/NilaHero'))

const HERO_LINES = ['Engineering the', 'Next Evolution.'] as const

// What the headline scrambles through on its way to settling. Alphanumeric
// only: punctuation and symbols read as damage rather than as a signal
// resolving, and the display face has no glyph for some of them.
const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

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

  /* The headline resolves out of alphanumeric noise, left to right.
     useLayoutEffect, not useEffect: this scrambles before the browser paints,
     so the finished heading is never shown and then taken away. */
  useLayoutEffect(() => {
    const chars = Array.from(
      pageRef.current?.querySelectorAll<HTMLElement>('.home-hero__char') ?? [],
    )
    if (!chars.length) return

    const randomGlyph = () => SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0]

    /* Each cell is pinned to the width of its own final glyph. The face is
       proportional — 'W' and 'I' are nowhere near the same advance — so
       without this every swap would reflow the line and the whole heading
       would twitch for the length of the animation. Read every width before
       writing any, or each write invalidates the next read. */
    const lockWidths = () => {
      const scrambled = chars.map((el) => el.textContent)
      chars.forEach((el) => {
        el.style.removeProperty('width')
        el.textContent = el.dataset.final ?? ''
      })
      const widths = chars.map((el) => el.getBoundingClientRect().width)
      chars.forEach((el, i) => {
        el.style.width = `${widths[i]}px`
        el.textContent = scrambled[i]
      })
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    chars.forEach((el) => { el.textContent = randomGlyph() })
    lockWidths()
    /* Widths measured above use whatever face is rendering right now. The
       webfont loads with display=swap, so remeasure when the real one lands. */
    let stale = false
    document.fonts?.ready.then(() => { if (!stale) lockWidths() })

    const STEP = 58 // delay added per character, so the decode sweeps rightward
    const HOLD = 620 // how long any one character stays unresolved
    const SWAP = 68 // gap between glyph swaps; per-frame reads as noise, not decoding

    const startedAt = performance.now()
    const lastSwap = chars.map(() => 0)
    let frame = 0

    const tick = (now: number) => {
      const elapsed = now - startedAt
      let settling = false

      chars.forEach((el, i) => {
        if (elapsed >= i * STEP + HOLD) {
          const final = el.dataset.final ?? ''
          if (el.textContent !== final) el.textContent = final
          return
        }
        settling = true
        if (now - lastSwap[i] >= SWAP) {
          lastSwap[i] = now
          el.textContent = randomGlyph()
        }
      })

      if (settling) {
        frame = requestAnimationFrame(tick)
      } else {
        // Hand the cells back to the layout: the heading is fluid-sized, and
        // pinned pixel widths would not survive a resize.
        chars.forEach((el) => el.style.removeProperty('width'))
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      stale = true
      cancelAnimationFrame(frame)
      chars.forEach((el) => {
        el.style.removeProperty('width')
        el.textContent = el.dataset.final ?? ''
      })
    }
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const hero = page.querySelector<HTMLElement>('.home-hero')
    if (!hero) return
    const heroTitle = hero.querySelector<HTMLElement>('.home-hero__stacked-text')
    const updateHeroShadow = () => {
      if (!heroTitle) return

      // Run the extrusion past the bottom of the hero and use the hero's
      // existing overflow clipping for a clean edge at the section boundary.
      // This keeps the hero at the same height while guaranteeing full depth.
      const shadowDepth = hero.clientHeight + heroTitle.offsetHeight

      // Each step is one full copy of the text to paint, and text-shadow is not
      // composited — every layer is repainted by the CPU. A 3px step over a tall
      // hero asked for 300+ copies, which is what made scroll and resize stutter.
      // MAX_LAYERS caps the bill; the step widens to cover the same depth, and
      // the glyphs are heavy enough that it still reads as one solid slab.
      const MAX_LAYERS = 90
      const step = Math.max(window.innerWidth <= 720 ? 6 : 3, shadowDepth / MAX_LAYERS)

      const shadowLayers: string[] = []
      for (let offset = step; offset <= shadowDepth; offset += step) {
        shadowLayers.push(`${Math.round(offset * 0.34)}px ${Math.round(offset)}px 0 #3e1650`)
      }

      heroTitle.style.textShadow = shadowLayers.join(',')
    }

    updateHeroShadow()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('resize', updateHeroShadow)
      return () => window.removeEventListener('resize', updateHeroShadow)
    }

    const animations = heroTitle
      ? [animate(heroTitle, { opacity: [0, 1], translateY: [34, 0], scale: [0.96, 1], duration: 900, ease: 'out(4)' })]
      : []

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

    const handleResize = () => {
      updateHeroShadow()
      onScroll()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleScroll()

    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.revert())
      heroTitle?.style.removeProperty('opacity')
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleResize)
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
    <section className="home-hero"><div className="home-hero__text-stage"><h1 className="home-hero__stacked-text" aria-label={HERO_LINES.join(' ')}>
      {/* Split to the character so each one can resolve on its own. Words stay
          atomic inline-blocks, otherwise the phone breakpoint — which allows
          wrapping — would be free to break a line mid-word between two cells.
          aria-hidden throughout: mid-decode this reads as noise, so the h1's
          aria-label carries the real heading. */}
      {HERO_LINES.map((line) => (
        <span className="home-hero__line" key={line} aria-hidden="true">
          {line.split(' ').map((word, wordIndex) => (
            <Fragment key={`${word}-${wordIndex}`}>
              {wordIndex > 0 && ' '}
              <span className="home-hero__word">
                {[...word].map((char, charIndex) => (
                  <span className="home-hero__char" key={charIndex} data-final={char}>{char}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      ))}
    </h1></div><Suspense fallback={null}><NilaHero /></Suspense></section>
    <section className="home-manifesto" data-reveal><p className="home-kicker reveal">The bitNtech approach</p><h2 className="reveal">Ideas gain momentum when <em>every layer</em> works together.</h2><div className="home-manifesto__footer reveal"><p>AI. Software. Hardware. One curious team, building things that are useful in the real world.</p><span>01 / 05</span></div></section>
    <section className="home-solutions" id="solutions" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Capabilities</p><h2>Choose your<br />launch point.</h2><p>Hover, tilt and pick a path into what we build.</p></div><div className="home-service-grid">{PATHS.map(({ num, Icon, title, body, to }) => <Link className="home-service reveal" key={num} to={to}><span className="home-service__number">{num}</span><Icon size={42} /><h3>{title}</h3><p>{body}</p><span className="home-service__arrow">↗</span></Link>)}</div></section>
    <section className="home-process" data-reveal ref={processRef}><div className="home-process__sticky"><p className="home-kicker reveal">From signal to system</p><h2 className="reveal">A process built to keep moving.</h2><p className="reveal">Scroll through the five moves that take a good question all the way to a working answer.</p></div><div className="home-process__list-wrap"><div className="home-process__line"><div className="home-process__line-progress" ref={lineRef} /></div><ol>{JOURNEY.map(([number, title, text]) => <li className="reveal" key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
    <section className="home-worlds" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Built for the real world</p><h2>Any industry.<br /><em>More possibility.</em></h2></div><div className="home-worlds__track reveal" ref={worldsTrackRef}>{INDUSTRIES.map((industry, index) => <div className="home-world" key={industry}><span>0{index + 1}</span><h3>{industry}</h3><i /></div>)}</div><div className="home-worlds__scrollbar reveal"><button type="button" aria-label="Scroll left" onClick={() => scrollWorlds(-1)}>‹</button><div className="home-worlds__scrollbar-track"><div className="home-worlds__scrollbar-thumb" ref={worldsThumbRef} /></div><button type="button" aria-label="Scroll right" onClick={() => scrollWorlds(1)}>›</button></div></section>
    <section className="home-closing" data-reveal><p className="home-kicker reveal">Make the next move</p><h2 className="reveal">Let’s make your idea <em>impossible to ignore.</em></h2><Link className="reveal" to="/contact">Tell us what you’re building <span>↗</span></Link></section>
  </main>
}
