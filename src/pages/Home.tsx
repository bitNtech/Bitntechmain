import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import {
  GlyphStack, GlyphChip, GlyphGear, GlyphCompass, GlyphChart, GlyphShield,
  GlyphPulse, GlyphSprout, GlyphLearn,
} from '../components/icons/Glyphs'
import HeroScene from '../components/home/HeroScene'
import './Home.css'

/* The two ways into what the studio builds. */
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

/* Each sector gets its own mark rather than a photo: generated, so there is
   nothing to fetch and nothing to 404, and it inherits the glyph system's own
   animation, in-view pausing and reduced-motion handling for free. Four of
   these already existed for the services list; three were added for the
   sectors that had no mark yet. */
const INDUSTRIES = [
  ['Healthcare', GlyphPulse],
  ['Agriculture', GlyphSprout],
  ['Manufacturing', GlyphGear],
  ['Education', GlyphLearn],
  ['Startups', GlyphCompass],
  ['SMBs', GlyphChart],
  ['Security', GlyphShield],
] as const

/**
 * Wrap every word of a heading in its own inline-block span so the reveal can
 * stagger across the line instead of lifting the block whole.
 *
 * It walks text nodes and recurses into elements rather than reading
 * textContent, because these headings carry <br> and <em> that carry the line
 * breaks and the accent colour — flattening them would lose both. Whitespace
 * is re-appended as-is so the words still wrap where the browser wants them.
 *
 * React never re-renders these nodes (the sections take no state), and this
 * runs once after mount, so the mutation and the vdom cannot disagree.
 */
function splitWords(el: Node) {
  for (const node of [...el.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      for (const part of (node.textContent ?? '').split(/(\s+)/)) {
        if (!part) continue
        if (!part.trim()) {
          frag.append(part)
          continue
        }
        const span = document.createElement('span')
        span.className = 'home-word'
        span.textContent = part
        frag.append(span)
      }
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR') {
      splitWords(node)
    }
  }
}

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

    /* Split before anything is observed, so the words are in place by the time
       the first section crosses the threshold. Scoped to the sections that
       actually have an observer: the split leaves its words hidden, and a
       heading nothing is watching would never be told to appear. */
    page.querySelectorAll<HTMLElement>('[data-reveal] h2').forEach(splitWords)

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      animate(entry.target.querySelectorAll('.reveal'), { opacity: [0, 1], translateY: [34, 0], rotateX: [-14, 0], delay: stagger(85), duration: 720, ease: 'out(4)' })
      /* The heading arrives across itself rather than as a block: a tighter
         beat than the section's own stagger, and a shade slower per word, so
         it reads as one sentence landing rather than nine things moving. */
      animate(entry.target.querySelectorAll('.home-word'), { opacity: [0, 1], translateY: [46, 0], filter: ['blur(9px)', 'blur(0px)'], delay: stagger(38, { start: 90 }), duration: 900, ease: 'out(4)' })
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
    <HeroScene />

    <section className="home-manifesto" data-reveal><p className="home-kicker reveal">The bitNtech approach</p><h2 className="reveal">Ideas gain momentum when <em>every layer</em> works together.</h2><div className="home-manifesto__footer reveal"><p>AI. Software. Hardware. One curious team, building things that are useful in the real world.</p><span>01 / 05</span></div></section>
    <section className="home-solutions" id="solutions" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Capabilities</p><h2>Choose your<br />launch point.</h2><p>Hover, tilt and pick a path into what we build.</p></div><div className="home-service-grid">{PATHS.map(({ num, Icon, title, body, to }) => <Link className="home-service reveal" key={num} to={to}><span className="home-service__number">{num}</span><Icon size={42} /><h3>{title}</h3><p>{body}</p><span className="home-service__arrow">↗</span></Link>)}</div></section>
    <section className="home-process" data-reveal ref={processRef}><div className="home-process__sticky"><p className="home-kicker reveal">From signal to system</p><h2 className="reveal">A process built to keep moving.</h2><p className="reveal">Scroll through the five moves that take a good question all the way to a working answer.</p></div><div className="home-process__list-wrap"><div className="home-process__line"><div className="home-process__line-progress" ref={lineRef} /></div><ol>{JOURNEY.map(([number, title, text]) => <li className="reveal" key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
    <section className="home-worlds" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Built for the real world</p><h2>Any industry.<br /><em>More possibility.</em></h2></div><div className="home-worlds__track reveal" ref={worldsTrackRef}>{INDUSTRIES.map(([industry, Mark], index) => <div className="home-world" key={industry}><span>0{index + 1}</span><Mark className="home-world__mark" size={46} /><h3>{industry}</h3><i /></div>)}</div><div className="home-worlds__scrollbar reveal"><button type="button" aria-label="Scroll left" onClick={() => scrollWorlds(-1)}>‹</button><div className="home-worlds__scrollbar-track"><div className="home-worlds__scrollbar-thumb" ref={worldsThumbRef} /></div><button type="button" aria-label="Scroll right" onClick={() => scrollWorlds(1)}>›</button></div></section>
    <section className="home-closing" data-reveal><p className="home-kicker reveal">Make the next move</p><h2 className="reveal">Let’s make your idea <em>impossible to ignore.</em></h2><Link className="reveal" to="/contact">Tell us what you’re building <span>↗</span></Link></section>
  </main>
}
