import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, createTimeline, stagger } from 'animejs'
import RobotArmModel from '../components/3d/RobotArmModel'
import CuteComputerModel from '../components/3d/InteractiveWorkspaceModel'
import ErrorBoundary from '../components/ErrorBoundary'
import { Bounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import './ExperiencePage.css'

function RobotArmScene({ pointerRef }: { pointerRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const ARM_FACING = Math.PI
  return (
    <div className="experience-object" aria-hidden="true" style={{ zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [2.5, 1.8, 3.5], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={1.6} />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.5}>
            <group rotation-y={ARM_FACING}>
              <RobotArmModel pointerRef={pointerRef} />
            </group>
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  )
}

function CuteComputerScene({ pointerRef }: { pointerRef: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <div className="experience-object" aria-hidden="true" style={{ zIndex: 0, pointerEvents: 'none' }}>
      <ErrorBoundary fallback={null}>
        <Canvas camera={{ position: [4, 3, 6], fov: 40 }}>
          <ambientLight intensity={2} />
          <directionalLight position={[4, 8, 4]} intensity={3} color="#fff5e6" />
          <directionalLight position={[-5, 3, -2]} intensity={1.2} color="#8ce5ff" />
          <pointLight position={[0, 2, -3]} intensity={1.5} color="#ab8cff" />
          <hemisphereLight args={['#ffffff', '#2a1a3a', 1.5]} />
          <Suspense fallback={null}>
            <CuteComputerModel pointerRef={pointerRef} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}

type Props = { mode: 'hardware' | 'software' }
const COPY = {
  hardware: { eyebrow: 'Physical intelligence', title: ['Make the', 'physical world', 'responsive.'], lead: 'Connected devices, sensor systems and robotic prototypes that turn real-world signals into useful action.', pillars: ['Embedded systems', 'Smart sensing', 'Robotics', 'IoT platforms'], hue: 'lime' },
  software: { eyebrow: 'Digital systems', title: ['Build products', 'people want', 'to return to.'], lead: 'From a sharp first interface to the infrastructure behind it, we make software that feels effortless and grows intelligently.', pillars: ['Product design', 'Web platforms', 'AI integration', 'Automation'], hue: 'violet' },
} as const
export default function ExperiencePage({ mode }: Props) {
  const page = useRef<HTMLElement>(null)
  const armPointerRef = useRef({ x: 0, y: 0 })
  const copy = COPY[mode]
  
  // Pointer tracking for both scenes
  useEffect(() => {
    const hero = page.current?.querySelector<HTMLElement>('.experience-hero')
    if (!hero) return
    let frame = 0
    let pointerX = 50
    let pointerY = 50
    const onPointerMove = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect()
      pointerX = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))
      pointerY = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100))
      armPointerRef.current.x = (pointerX / 100) * 2 - 1
      armPointerRef.current.y = (pointerY / 100) * 2 - 1
    }
    const onPointerLeave = () => {
      armPointerRef.current.x = 0
      armPointerRef.current.y = 0
    }
    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    return () => {
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
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
  return <main ref={page} className={`experience experience--${copy.hue}`}>
    <section className="experience-hero"><div className="experience-hero__grid" aria-hidden="true" /><div className="experience-hero__meter experience-hero__body" aria-hidden="true"><span>01 / {mode === 'hardware' ? 'HARDWARE' : 'SOFTWARE'}</span><i /></div><p className="experience-hero__eyebrow">{copy.eyebrow}</p><h1 aria-label={copy.title.join(' ')}>{copy.title.map(line=><span className="experience-title-wrap" key={line}><span className="experience-title-line">{line}</span></span>)}</h1><p className="experience-lead experience-hero__body">{copy.lead}</p><a className="experience-hero__body" href="#field">Enter the field <b>↓</b></a>
    
    {mode === 'hardware' ? (
      <RobotArmScene pointerRef={armPointerRef} />
    ) : (
      <CuteComputerScene pointerRef={armPointerRef} />
    )}
    
    <p className="experience-hero__index experience-hero__body" aria-hidden="true">SYSTEM<br />ONLINE</p></section>
    <section className="experience-field" id="field" data-xp><div className="xp-reveal"><p className="xp-label">Explore the system</p><h2>Every layer,<br /><em>in conversation.</em></h2></div><div className="experience-pillar-grid">{copy.pillars.map((item,index)=><article className="xp-reveal" key={item}><span>0{index+1}</span><h3>{item}</h3><p>Designed as a flexible part of a larger, living product ecosystem.</p><b>↗</b></article>)}</div></section>
    <section className="experience-quote" data-xp><p className="xp-reveal">Not a stack of features. A <em>living experience</em> with a clear reason to exist.</p></section>
    <section className="experience-cta" data-xp><p className="xp-label xp-reveal">Have a project in mind?</p><h2 className="xp-reveal">Let’s give it<br />some momentum.</h2><Link className="xp-reveal" to="/contact">Talk to bitNtech <span>↗</span></Link></section>
  </main>
}
