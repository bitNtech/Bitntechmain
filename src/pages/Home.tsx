import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { GlyphNeural, GlyphAgent, GlyphStack, GlyphSurface, GlyphGear, GlyphArm } from '../components/icons/Glyphs'
import './Home.css'

// How far each joint swings, base -> wrist. Signs verified against the rendered

const SERVICES = [
  { num: '01', Icon: GlyphNeural, title: 'Artificial Intelligence', body: 'Systems that decide, not just compute.' },
  { num: '02', Icon: GlyphAgent, title: 'AI Agents', body: 'Autonomy with accountability.' },
  { num: '03', Icon: GlyphStack, title: 'Software Engineering', body: 'Secure, scalable, tailored.' },
  { num: '04', Icon: GlyphSurface, title: 'Web & Mobile', body: 'Every surface, one system.' },
  { num: '05', Icon: GlyphGear, title: 'Automation', body: 'Remove the repeat.' },
  { num: '06', Icon: GlyphArm, title: 'Robotics', body: 'Machines with judgement.' },
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
      const shadowLayers: string[] = []

      for (let offset = 3; offset <= shadowDepth; offset += 3) {
        shadowLayers.push(`${Math.round(offset * 0.34)}px ${offset}px 0 #3e1650`)
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
      const fillBottom = rect.top + totalScroll * progress
      const listItems = processRef.current.querySelectorAll('li')
      listItems.forEach((li) => {
        const badge = li.querySelector<HTMLElement>('.process-number')
        if (!badge) return

        const badgeRect = badge.getBoundingClientRect()
        const badgeProgress = Math.max(0, Math.min(1, (fillBottom - badgeRect.top) / badgeRect.height))
        badge.style.setProperty('--process-box-progress', badgeProgress.toString())
        li.classList.toggle('is-active', badgeProgress > 0)
      })
    }

    const handleResize = () => {
      updateHeroShadow()
      handleScroll()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleScroll()

    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.revert())
      heroTitle?.style.removeProperty('opacity')
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return <main className="home-experience" ref={pageRef}>
    <section className="home-hero"><div className="home-hero__text-stage"><h1 className="home-hero__stacked-text" aria-label="Engineering the Next Evolution."><span>Engineering the</span><span>Next Evolution.</span></h1></div></section>
    <section className="home-manifesto" data-reveal><p className="home-kicker reveal">The bitNtech approach</p><h2 className="reveal">Ideas gain momentum when <em>every layer</em> works together.</h2><div className="home-manifesto__footer reveal"><p>AI. Software. Hardware. One curious team, building things that are useful in the real world.</p><span>01 / 05</span></div></section>
    <section className="home-solutions" id="solutions" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Capabilities</p><h2>Choose your<br />launch point.</h2><p>Hover, tilt and explore the building blocks of your next product.</p></div><div className="home-service-grid">{SERVICES.map(({ num, Icon, title, body }) => <article className="home-service reveal" key={num}><span className="home-service__number">{num}</span><Icon size={42} /><h3>{title}</h3><p>{body}</p><span className="home-service__arrow">↗</span></article>)}</div></section>
    <section className="home-process" data-reveal ref={processRef}><div className="home-process__sticky"><p className="home-kicker reveal">From signal to system</p><h2 className="reveal">A process built to keep moving.</h2><p className="reveal">Scroll through the five moves that take a good question all the way to a working answer.</p></div><div className="home-process__list-wrap"><div className="home-process__line"><div className="home-process__line-progress" ref={lineRef} /></div><ol>{JOURNEY.map(([number, title, text]) => <li className="reveal" key={number}><span className="process-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
    <section className="home-worlds" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Built for the real world</p><h2>Any industry.<br /><em>More possibility.</em></h2></div><div className="home-worlds__track reveal">{INDUSTRIES.map((industry, index) => <div className="home-world" key={industry}><span>0{index + 1}</span><h3>{industry}</h3><i /></div>)}</div></section>
    <section className="home-closing" data-reveal><p className="home-kicker reveal">Make the next move</p><h2 className="reveal">Let’s make your idea <em>impossible to ignore.</em></h2><Link className="reveal" to="/contact">Tell us what you’re building <span>↗</span></Link></section>
  </main>
}
