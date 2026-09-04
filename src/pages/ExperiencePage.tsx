import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, createTimeline, stagger } from 'animejs'
import { SERVICES } from '../data/services'
import { canAffordHeavyMedia } from '../lib/utils'
import './ExperiencePage.css'

/* three.js, drei and a multi-megabyte GLB behind a dynamic import, so the page's
   own chunk carries none of it and a visitor who is never shown the model never
   pays for it. Loaded only once `canAffordHeavyMedia()` agrees — see there. */
const HeroModels = lazy(() => import('../components/3d/HeroModels'))

/* The CSS ornament the hero falls back to: concentric rings around a lit core,
   the same silhouette in the same place as the model, for anyone on a metered
   or slow connection, a low-memory device, or reduced motion. */
function ObjectShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="experience-object" aria-hidden="true" style={{ zIndex: 0, pointerEvents: 'none' }}>
      {children ?? (<><i /><i /><i /><strong /></>)}
    </div>
  )
}

type Props = { mode: 'hardware' | 'software' }
const COPY = {
  hardware: { eyebrow: 'Physical intelligence', title: ['Make the', 'physical world', 'responsive.'], lead: 'Connected devices, sensor systems and robotic prototypes that turn real-world signals into useful action.', hue: 'lime' },
  software: { eyebrow: 'Digital systems', title: ['Build products', 'people want', 'to return to.'], lead: 'From a sharp first interface to the infrastructure behind it, we make software that feels effortless and grows intelligently.', hue: 'violet' },
} as const
export default function ExperiencePage({ mode }: Props) {
  const page = useRef<HTMLElement>(null)
  const armPointerRef = useRef({ x: 0, y: 0 })
  const copy = COPY[mode]
  const pillars = SERVICES.filter(s => s.domain === mode)
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)
  /* Decided after mount, never during render: the answer depends on
     `navigator` and on a media query, and reading either while rendering makes
     the first paint depend on the device rather than on the markup. */
  const [heavyOk, setHeavyOk] = useState(false)
  useEffect(() => { setHeavyOk(canAffordHeavyMedia()) }, [])

  // Pointer tracking for both scenes
  useEffect(() => {
    const hero = page.current?.querySelector<HTMLElement>('.experience-hero')
    if (!hero) return
    // Measuring the hero on every pointermove forces a layout per mouse event.
    // The box only moves when the page resizes or scrolls, so cache it there.
    let bounds = hero.getBoundingClientRect()
    const measure = () => { bounds = hero.getBoundingClientRect() }
    const onPointerMove = (event: PointerEvent) => {
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
      armPointerRef.current.x = x * 2 - 1
      armPointerRef.current.y = y * 2 - 1
    }
    const onPointerLeave = () => {
      armPointerRef.current.x = 0
      armPointerRef.current.y = 0
    }
    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [mode])
  
  useEffect(() => {
    const root = page.current
    const hero = root?.querySelector<HTMLElement>('.experience-hero')
    if (!root || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const animations = [
      createTimeline()
        .add(hero.querySelector<HTMLElement>('.experience-hero__eyebrow')!, { opacity: [0, 1], translateY: [18, 0], duration: 520, ease: 'out(4)' })
        .add(hero.querySelectorAll<HTMLElement>('.experience-title-line'), { opacity: [0, 1], translateY: ['112%', '0%'], rotate: [3, 0], duration: 900, delay: stagger(95), ease: 'out(5)' }, '-=220')
        .add(hero.querySelectorAll<HTMLElement>('.experience-hero__body'), { opacity: [0, 1], translateY: [26, 0], duration: 620, delay: stagger(90), ease: 'out(4)' }, '-=480'),
      animate(hero.querySelector<HTMLElement>('.experience-hero__meter i')!, { scaleX: [0.2, 1, 0.2], duration: 1700, ease: 'inOutSine', loop: true }),
    ]

    const observer = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ animate(e.target.querySelectorAll('.xp-reveal'), {opacity:[0,1], translateY:[50,0], rotateX:[-18,0], delay:stagger(110), duration:750, ease:'out(4)'}); observer.unobserve(e.target)}}), {threshold:.18})
    root.querySelectorAll<HTMLElement>('[data-xp]').forEach(el=>observer.observe(el))
    return () => { observer.disconnect(); animations.forEach(animation => animation.revert()) }
  }, [mode])
  return <main ref={page} id="main" className={`experience experience--${copy.hue}`}>
    <section className="experience-hero"><div className="experience-hero__grid" aria-hidden="true" /><div className="experience-hero__meter experience-hero__body" aria-hidden="true"><span>01 / {mode === 'hardware' ? 'HARDWARE' : 'SOFTWARE'}</span><i /></div><p className="experience-hero__eyebrow">{copy.eyebrow}</p><h1 aria-label={copy.title.join(' ')}>{copy.title.map(line=><span className="experience-title-wrap" key={line}><span className="experience-title-line">{line}</span></span>)}</h1><p className="experience-lead experience-hero__body">{copy.lead}</p><a className="experience-hero__body" href="#field">Enter the field <b>↓</b></a>
    
    {heavyOk
      ? <Suspense fallback={<ObjectShell />}><ObjectShell><HeroModels mode={mode} pointerRef={armPointerRef} /></ObjectShell></Suspense>
      : <ObjectShell />}

    <p className="experience-hero__index experience-hero__body" aria-hidden="true">SYSTEM<br />ONLINE</p></section>
    <section className="experience-field" id="field" data-xp><div className="xp-reveal"><p className="xp-label">Explore the system</p><h2>Every layer,<br /><em>in conversation.</em></h2></div><div className="experience-pillar-grid">{pillars.map(({ Icon, title, body, desc, items }, index)=>{
      const expanded = expandedPillar === title
      return <article
        className={`xp-reveal experience-pillar${expanded ? ' experience-pillar--expanded' : ''}`}
        key={title}
        onClick={() => setExpandedPillar(v => v === title ? null : title)}
        /* A div with role="button" is only a button if it also answers the
           keyboard the way one does. Space additionally has to be stopped from
           scrolling the page. */
        onKeyDown={e => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          setExpandedPillar(v => v === title ? null : title)
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="experience-pillar__row">
          <div className="experience-pillar__head"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={28} /><h3>{title}</h3></div>
          <div className="experience-pillar__meta"><p>{body}</p><b>{expanded ? '×' : '+'}</b></div>
        </div>
        <div className="experience-pillar__collapse"><div className="experience-pillar__collapse-inner">
          <p className="experience-pillar__desc">{desc}</p>
          <ul className="experience-pillar__items">{items.map(entry=><li key={entry}>{entry}</li>)}</ul>
        </div></div>
      </article>
    })}</div></section>
    <section className="experience-quote" data-xp><p className="xp-reveal">Not a stack of features. A <em>living experience</em> with a clear reason to exist.</p></section>
    <section className="experience-cta" data-xp><p className="xp-label xp-reveal">Have a project in mind?</p><h2 className="xp-reveal">Let’s give it<br />some momentum.</h2><Link className="xp-reveal" to="/contact">Talk to bitNtech <span>↗</span></Link></section>
  </main>
}
