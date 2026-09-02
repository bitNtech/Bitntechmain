import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AboutUs.css'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  { rot: -9, depth: 14, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: -5, depth: 10, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: -2, depth: 8, img: '/assets/akashimg.png' },
  { rot: 3, depth: 12, img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: 0, depth: 6, img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: 4, depth: 11, img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: 7, depth: 9, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=faces&q=80' },
  { rot: -4, depth: 13, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces&q=80' },
]

const TEAM = [
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Mateus Aldana', role: 'Creative Director' },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Eli Ramirez', role: 'Design Lead' },
  { img: '/assets/akashimg.png', name: 'Naomi Park', role: 'Brand Strategist' },
  { img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Theo Vance', role: 'Senior Engineer' },
  { img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Kit Bellamy', role: 'Art Direction' },
  { img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Ravi Saigal', role: 'Motion · 3D' },
  { img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Iris Caldwell', role: 'Producer' },
  { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=540&fit=crop&crop=faces&q=80', name: 'Maya Okafor', role: 'Founder · CEO' },
]

/* PLACEHOLDER MILESTONES — the note below is deliberately the same on all five
   until the real dates and details are confirmed. Order is the content here:
   the signal under the cards steps up once per entry, so adding or removing one
   means changing WAVE_PATH and the `repeat(5, ...)` grids in AboutUs.css. */
const MILESTONE_NOTE =
  'A short note on what changed at this point — what we started building, who it was for, and what it taught us.'

const MILESTONES = [
  { year: '2019', title: 'Beginning', tags: ['Software', 'Web'] },
  { year: '2021', title: 'Expansion', tags: ['AI', 'Data'] },
  { year: '2023', title: 'Building bitNtech', tags: ['Embedded', 'IoT'] },
  { year: '2025', title: 'Into robotics', tags: ['Robotics'] },
  { year: '2026', title: 'The Next Evolution', tags: ['Systems'] },
] as const

/* One rising edge per milestone, at 10/30/50/70/90% of the width — the centres
   of five equal columns, so every card sits directly over its own step. The
   viewBox is 120 tall and so is the rendered box, so `y` units are px: that is
   what lets each card's stem drop to calc(90px - i * 20px) and land on its
   step. preserveAspectRatio="none" stretches it to any width. */
const WAVE_PATH = 'M0,110 H100 V90 H300 V70 H500 V50 H700 V30 H900 V10 H1000'

const STATS = [
  { count: 62, decimals: 0, suffix: '', label: 'Projects shipped' },
  { count: 14, decimals: 0, suffix: 'yrs', label: 'Combined craft' },
  { count: 9, decimals: 1, suffix: '', label: 'Avg NPS' },
]

export default function AboutUs() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.set('.navbar', { opacity: 0, y: -20 })
      gsap.set('.small-team .word > span', { y: '105%' })
      gsap.set('.big-results .letter', { y: 80, opacity: 0 })
      gsap.set('.nb-subline', { opacity: 0, y: 20 })
      gsap.set('.t-card', { opacity: 0 })
      gsap.set('.stats-inner', { opacity: 0 })

      const cards = gsap.utils.toArray<HTMLElement>('.card')
      cards.forEach((card) => {
        const rot = parseFloat(card.dataset.rot || '0')
        card.dataset.restRot = String(rot)
        gsap.set(card, { y: -800, rotation: rot + 25, opacity: 0, scale: 0.7 })
      })

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .to('.navbar', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
        .to('.small-team .word > span', { y: '0%', duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.3)
        .to('.big-results .letter', { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'back.out(1.6)' }, 0.55)
        .to(
          '.card',
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: (_i, el) => parseFloat((el as HTMLElement).dataset.restRot || '0'),
            duration: 1.1,
            stagger: { each: 0.08, from: 'center' },
            ease: 'back.out(1.4)',
          },
          0.8,
        )
        .to('.nb-subline', { opacity: 1, y: 0, duration: 0.8 }, 1.6)

      cards.forEach((card, i) => {
        const rot = parseFloat(card.dataset.restRot || '0')
        gsap.to(card, {
          y: `+=${8 + (i % 3) * 5}`,
          rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
          duration: 3 + (i % 4) * 0.5,
          delay: 1.8 + i * 0.1,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      const hero = root.querySelector<HTMLElement>('.hero')
      let mx = 0, my = 0, tx = 0, ty = 0
      let raf = 0

      const onMove = (e: MouseEvent) => {
        if (!hero) return
        const r = hero.getBoundingClientRect()
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2
        my = ((e.clientY - r.top) / r.height - 0.5) * 2
      }
      const onLeave = () => {
        mx = 0
        my = 0
      }
      hero?.addEventListener('mousemove', onMove)
      hero?.addEventListener('mouseleave', onLeave)

      const parallax = () => {
        tx += (mx - tx) * 0.05
        ty += (my - ty) * 0.05
        cards.forEach((card) => {
          const d = parseFloat(card.dataset.depth || '8')
          card.style.translate = `${tx * d}px ${ty * d * 0.5}px`
        })
        raf = requestAnimationFrame(parallax)
      }
      parallax()

      cards.forEach((card) => {
        const onCardMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          gsap.to(card, {
            rotateX: -py * 16,
            rotateY: px * 16,
            scale: 1.12,
            zIndex: 20,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 700,
            overwrite: 'auto',
          })
        }
        const onCardLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            zIndex: card.style.zIndex || '',
            duration: 0.8,
            ease: 'elastic.out(1, 0.6)',
            overwrite: 'auto',
          })
        }
        const onCardClick = () => {
          gsap.fromTo(card, { scale: 1.15 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' })
        }
        card.addEventListener('mousemove', onCardMove)
        card.addEventListener('mouseleave', onCardLeave)
        card.addEventListener('click', onCardClick)
      })

      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set('.big-results', { scale: 1 + 0.15 * p, opacity: 1 - 0.4 * p })
          gsap.set('.small-team', { y: -60 * p, opacity: 1 - p * 1.5 })
          const moves = [
            { x: -260, y: -40, rot: -25 },
            { x: -200, y: 20, rot: -18 },
            { x: -120, y: 80, rot: -10 },
            { x: -40, y: 120, rot: -4 },
            { x: 40, y: 120, rot: 4 },
            { x: 120, y: 80, rot: 12 },
            { x: 200, y: 20, rot: 22 },
            { x: 260, y: -40, rot: 28 },
          ]
          cards.forEach((card, i) => {
            const m = moves[i]
            const rest = parseFloat(card.dataset.restRot || '0')
            gsap.set(card, { x: m.x * p, y: m.y * p, rotation: rest + m.rot * p })
          })
          gsap.set('.nb-subline', { opacity: 1 - p * 2 })
        },
      })

      /* One beat, not five: the trace draws left to right and each card lands
         as the signal passes under it. Guarded rather than tweened at zero
         duration, so that with reduced motion the dasharray is never set and
         the wave simply renders drawn. */
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const wave = root.querySelector<SVGPathElement>('.tl-wave__path')
        const sweep = 1.7
        if (wave) {
          /* Not getTotalLength(): that is measured in viewBox units (~1100),
             but non-scaling-stroke makes the dash array screen pixels, and the
             box is stretched wider than its viewBox. The short dash left the
             last step undrawn. Rendered length is the horizontal run plus the
             120 units of vertical travel, which are 1:1 here. */
          const drawLength = wave.getBoundingClientRect().width + 140
          gsap.set(wave, { strokeDasharray: drawLength, strokeDashoffset: drawLength })
          gsap.to(wave, {
            strokeDashoffset: 0,
            duration: sweep,
            ease: 'power1.inOut',
            scrollTrigger: { trigger: '.tl-plot', start: 'top 78%' },
            // Drop the dashes once drawn, so a later resize cannot re-clip it.
            onComplete: () => gsap.set(wave, { clearProps: 'strokeDasharray,strokeDashoffset' }),
          })
        }
        /* Opacity only, deliberately. The stem hangs off the card's bottom edge
           and has to meet the trace exactly, so anything that moves the card
           moves the pad off the line — a `y` here left every pad 34px low. The
           drawing trace already supplies the movement. */
        gsap.from('.tl-card', {
          opacity: 0,
          duration: 0.7,
          // Five cards across the sweep, so each lands as the signal reaches it.
          stagger: sweep / MILESTONES.length,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.tl-plot', start: 'top 78%' },
        })
        gsap.from('.tl-axis li', {
          opacity: 0,
          duration: 0.4,
          stagger: sweep / MILESTONES.length,
          ease: 'none',
          scrollTrigger: { trigger: '.tl-plot', start: 'top 78%' },
        })
      }

      gsap.from('.tl-head .eyebrow, .tl-head h2', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.tl-head', start: 'top 82%' },
      })

      /* Was `.eyebrow, .team-head h2, ...`. There is no eyebrow inside
         .team-head, so that bare selector now only matches the timeline's —
         which this trigger would have held hidden until the team section. */
      gsap.from('.team-head h2, .team-head p', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.team-head', start: 'top 80%' },
      })

      gsap.to('.t-card', {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.team-grid', start: 'top 80%' },
      })
      gsap.from('.t-card', {
        y: 80,
        scale: 0.9,
        rotation: (i: number) => (i % 2 === 0 ? -3 : 3),
        duration: 1,
        stagger: 0.08,
        ease: 'back.out(1.3)',
        scrollTrigger: { trigger: '.team-grid', start: 'top 80%' },
      })

      gsap.to('.stats-inner', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.stats', start: 'top 80%' },
      })
      gsap.from('.stats-inner', {
        y: 60,
        scale: 0.97,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.stats', start: 'top 80%' },
      })

      ScrollTrigger.create({
        trigger: '.stats',
        start: 'top 75%',
        onEnter: () => {
          root.querySelectorAll<HTMLElement>('.stat-block .num').forEach((el) => {
            const target = parseFloat(el.dataset.count || '0')
            const span = el.querySelector('span')
            gsap.to(
              { v: 0 },
              {
                v: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: function (this: gsap.core.Tween) {
                  if (span) span.textContent = Math.floor((this.targets()[0] as { v: number }).v).toLocaleString()
                },
              },
            )
          })
        },
        once: true,
      })

      const bigResultsWrap = root.querySelector('.big-results-wrap')
      bigResultsWrap?.addEventListener('mouseenter', () => {
        gsap.to('.big-results .letter', { y: -8, duration: 0.5, stagger: 0.03, ease: 'back.out(1.6)' })
      })
      bigResultsWrap?.addEventListener('mouseleave', () => {
        gsap.to('.big-results .letter', { y: 0, duration: 0.6, stagger: 0.03, ease: 'elastic.out(1, 0.6)' })
      })

      return () => {
        hero?.removeEventListener('mousemove', onMove)
        hero?.removeEventListener('mouseleave', onLeave)
        cancelAnimationFrame(raf)
      }
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <main className="about-us" ref={rootRef}>
      <div className="grain" />

      <section className="hero">
        <h1 className="small-team">
          <span className="word"><span>Small</span></span>&nbsp;<span className="word"><span>team,</span></span>
        </h1>

        <div className="big-results-wrap">
          <div className="big-results">
            {'big results'.split('').map((ch, i) => (
              <span className="letter" key={i}>{ch === ' ' ? ' ' : ch}</span>
            ))}
          </div>
        </div>

        <div className="cards-row">
          {CARDS.map((c, i) => (
            <div key={i} className={`card card-${i + 1}`} data-rot={c.rot} data-depth={c.depth}>
              <img src={c.img} alt="" />
            </div>
          ))}
        </div>

        <div className="subline nb-subline">
          <div className="subline-text">8 people. 60+ shipped projects. Zero filler.</div>
        </div>
      </section>

      <section className="company-brief">
        <p>
          bitNtech is a technology and engineering company building intelligent solutions for an evolving world.
          We work across software, artificial intelligence, robotics, embedded systems, IoT and digital products
          to transform ideas and real-world problems into practical technology.
        </p>
      </section>

      {/* The milestones, drawn as a signal that steps up once per entry: the
          cards are the readout, the wave under them is the trace, and the rule
          at the bottom is the time axis. Replaces the row of arrow pills that
          used to sit inside the brief above. */}
      <section className="tl" aria-labelledby="tl-title">
        <div className="tl-head">
          <p className="eyebrow">Build log</p>
          <h2 id="tl-title">
            Every step, <em>still going up</em>.
          </h2>
        </div>

        <div className="tl-scope" data-touch-rail>
          <div className="tl-plot">
            <ol className="tl-cards">
              {MILESTONES.map((milestone, index) => (
                <li className="tl-card" key={milestone.year} style={{ '--tl-i': String(index) } as React.CSSProperties}>
                  <span className="tl-card__index">{String(index + 1).padStart(2, '0')}</span>
                  {/* The year is on the axis for sighted readers; this keeps it
                      attached to its milestone for everyone else. */}
                  <span className="tl-sr">{milestone.year}</span>
                  <h3>{milestone.title}</h3>
                  <p>{MILESTONE_NOTE}</p>
                  <ul className="tl-tags">
                    {milestone.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  <span className="tl-stem" aria-hidden="true" />
                </li>
              ))}
            </ol>

            <svg className="tl-wave" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="tl-wave-ink" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--nb-orange-1)" />
                  <stop offset="100%" stopColor="var(--nb-orange-3)" />
                </linearGradient>
              </defs>
              {/* Stretched horizontally, so the stroke has to opt out of scaling
                  or it would thin out as the section gets wider. */}
              <path className="tl-wave__path" d={WAVE_PATH} vectorEffect="non-scaling-stroke" />
            </svg>

            <ol className="tl-axis" aria-hidden="true">
              {MILESTONES.map((milestone) => (
                <li key={milestone.year}>{milestone.year}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="team-head">
          <div>
            
            <h2>Designers, builders<br />and the <em>quietly brilliant</em>.</h2>
          </div>
          <p>Every person you see here touches every project we ship. No middle layer, no handoffs to strangers — just direct work with the people doing it.</p>
        </div>

        <div className="team-grid">
          {TEAM.map((m) => (
            <div className="t-card" key={m.name}>
              <img src={m.img} alt="" />
              <div className="t-meta">
                <div className="nm">{m.name}</div>
                <div className="rl">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-inner">
          <h3>Eight humans.<br />One <em>tight ship</em>.</h3>
          {STATS.map((s) => (
            <div className="stat-block" key={s.label}>
              <div className="num" data-count={s.count}>
                <span>0</span>
                {s.decimals > 0 && <small>.{'0'.repeat(s.decimals)}</small>}
                {s.suffix && <small>{s.suffix}</small>}
              </div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
