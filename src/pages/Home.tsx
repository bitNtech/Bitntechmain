import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, createTimeline, stagger } from 'animejs'
import { GlyphNeural, GlyphAgent, GlyphStack, GlyphSurface, GlyphGear, GlyphArm } from '../components/icons/Glyphs'
import './Home.css'

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
  useEffect(() => {
    const page = pageRef.current
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const hero = page.querySelector<HTMLElement>('.home-hero')
    if (!hero) return
    const heroEntrances = hero.querySelectorAll<HTMLElement>('[data-hero-enter]')
    const rings = hero.querySelectorAll<HTMLElement>('.home-orbit__ring')
    const particles = hero.querySelectorAll<HTMLElement>('.home-orbit__particle')
    const animations = [
      createTimeline()
        .add(hero.querySelector<HTMLElement>('.home-hero__eyebrow')!, { opacity: [0, 1], translateY: [18, 0], duration: 520, ease: 'out(4)' })
        .add(hero.querySelectorAll<HTMLElement>('.home-hero__title-line'), { opacity: [0, 1], translateY: ['110%', '0%'], rotate: [3, 0], duration: 960, delay: stagger(105), ease: 'out(5)' }, '-=240')
        .add(hero.querySelectorAll<HTMLElement>('.home-hero__body'), { opacity: [0, 1], translateY: [24, 0], duration: 640, delay: stagger(95), ease: 'out(4)' }, '-=520'),
      animate(rings, { rotate: (index: number) => index ? -360 : 360, duration: (index: number) => index ? 24000 : 32000, ease: 'linear', loop: true }),
      animate(hero.querySelector<HTMLElement>('.home-orbit__core')!, { scale: [0.86, 1.1, 0.86], duration: 3200, ease: 'inOutSine', loop: true }),
      animate(particles, { rotate: 360, duration: 9200, ease: 'linear', loop: true }),
      animate(hero.querySelector<HTMLElement>('.home-hero__status i')!, { scaleX: [0.25, 1, 0.25], duration: 1900, ease: 'inOutSine', loop: true }),
    ]

    let frame = 0
    let pointerX = 50
    let pointerY = 50
    const paintPointer = () => {
      hero.style.setProperty('--hero-pointer-x', `${pointerX}%`)
      hero.style.setProperty('--hero-pointer-y', `${pointerY}%`)
      frame = 0
    }
    const onPointerMove = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect()
      pointerX = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
      pointerY = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
      if (!frame) frame = requestAnimationFrame(paintPointer)
    }
    const onPointerLeave = () => {
      pointerX = 50
      pointerY = 50
      if (!frame) frame = requestAnimationFrame(paintPointer)
    }
    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      animate(entry.target.querySelectorAll('.reveal'), { opacity: [0, 1], translateY: [34, 0], rotateX: [-14, 0], delay: stagger(85), duration: 720, ease: 'out(4)' })
      observer.unobserve(entry.target)
    }), { threshold: 0.16 })
    page.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el))
    return () => {
      observer.disconnect()
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      if (frame) cancelAnimationFrame(frame)
      animations.forEach((animation) => animation.revert())
      heroEntrances.forEach((element) => element.style.removeProperty('opacity'))
    }
  }, [])
  return <main className="home-experience" ref={pageRef}>
    <section className="home-hero"><div className="home-hero__grid" aria-hidden="true" /><div className="home-hero__glow" aria-hidden="true" /><div className="home-hero__status home-hero__body" data-hero-enter aria-hidden="true"><span>Live system</span><i /></div><div className="home-orbit" aria-hidden="true"><i className="home-orbit__ring" /><i className="home-orbit__ring home-orbit__ring--two" /><i className="home-orbit__particle home-orbit__particle--one" /><i className="home-orbit__particle home-orbit__particle--two" /><b className="home-orbit__core" /></div><div className="home-hero__copy"><p className="home-kicker home-hero__eyebrow" data-hero-enter>Engineering the next evolution</p><h1 aria-label="Technology that moves you forward."><span className="home-hero__title-wrap"><span className="home-hero__title-line" data-hero-enter>Technology that</span></span><span className="home-hero__title-wrap"><em className="home-hero__title-line" data-hero-enter>moves you forward.</em></span></h1><p className="home-lede home-hero__body" data-hero-enter>We design intelligent digital and physical products for businesses, startups and ambitious teams.</p><div className="home-actions home-hero__body" data-hero-enter><Link to="/contact">Start a project <span>↗</span></Link><a href="#solutions">Explore capabilities <span>↓</span></a></div></div><p className="home-scroll home-hero__body" data-hero-enter>Scroll to explore <span /></p><p className="home-hero__coordinates home-hero__body" data-hero-enter aria-hidden="true">18.521 / 73.854<br />BUILD / 2026</p></section>
    <section className="home-manifesto" data-reveal><p className="home-kicker reveal">The bitNtech approach</p><h2 className="reveal">Ideas gain momentum when <em>every layer</em> works together.</h2><div className="home-manifesto__footer reveal"><p>AI. Software. Hardware. One curious team, building things that are useful in the real world.</p><span>01 / 05</span></div></section>
    <section className="home-solutions" id="solutions" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Capabilities</p><h2>Choose your<br />launch point.</h2><p>Hover, tilt and explore the building blocks of your next product.</p></div><div className="home-service-grid">{SERVICES.map(({ num, Icon, title, body }) => <article className="home-service reveal" key={num}><span className="home-service__number">{num}</span><Icon size={42} /><h3>{title}</h3><p>{body}</p><span className="home-service__arrow">↗</span></article>)}</div></section>
    <section className="home-process" data-reveal><div className="home-process__sticky"><p className="home-kicker reveal">From signal to system</p><h2 className="reveal">A process built to keep moving.</h2><p className="reveal">Scroll through the five moves that take a good question all the way to a working answer.</p></div><ol>{JOURNEY.map(([number, title, text]) => <li className="reveal" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><b>+</b></li>)}</ol></section>
    <section className="home-worlds" data-reveal><div className="home-section-head reveal"><p className="home-kicker">Built for the real world</p><h2>Any industry.<br /><em>More possibility.</em></h2></div><div className="home-worlds__track reveal">{INDUSTRIES.map((industry, index) => <div className="home-world" key={industry}><span>0{index + 1}</span><h3>{industry}</h3><i /></div>)}</div></section>
    <section className="home-closing" data-reveal><p className="home-kicker reveal">Make the next move</p><h2 className="reveal">Let’s make your idea <em>impossible to ignore.</em></h2><Link className="reveal" to="/contact">Tell us what you’re building <span>↗</span></Link></section>
  </main>
}
