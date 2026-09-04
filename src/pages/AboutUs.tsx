import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AboutUs.css'

gsap.registerPlugin(ScrollTrigger)

/* The seven. One source of truth: the hero's floating cards, the team grid and
   the profile card all read this list, so a person is added, removed or given
   a new link in exactly one place. `img: null` means we have no real portrait
   yet — the card falls back to initials rather than a stock face. Image paths
   are lower-case and hyphenated on purpose: some arrived with spaces and a
   capital, which survives a Windows dev server (case-insensitive) and then
   404s on a Linux host. Hero geometry (rot/depth) lives here too; the matching
   sizes/positions are .card-1..7 in AboutUs.css.

   Social links are optional per person and per network — several have no
   GitHub, and a row that is not there simply is not rendered. Every URL is
   normalised through `link()` below. */
type Member = {
  name: string
  role: string
  img: string | null
  rot: number
  depth: number
  instagram: string | null
  linkedin: string | null
  github: string | null
  /* What Nila says when she flies to this card on the tour. Written per person
     and pitched at what they actually do — she reaches it through `data-nila`,
     because a card whose entire content is a name and a job title gives her
     nothing to build a line out of on her own. */
  punch: string
}

const TEAM: readonly Member[] = [
  {
    name: 'Veeraragavan Natarajan', role: 'Founder & CEO', img: '/assets/veera.jpg', rot: -9, depth: 14,
    instagram: 'https://www.instagram.com/veerzz_23/',
    linkedin: 'www.linkedin.com/in/veeraragavannatarajan',
    github: 'https://github.com/Veeraragavan-Natarajan',
    punch: "Veeraragavan started all this. He decides where we point — then goes and builds it too.",
  },
  {
    name: 'Prem Kumar Ramamoorthy', role: 'Co-Founder & CTO', img: '/assets/prem-kumar.jpg', rot: -5, depth: 10,
    instagram: 'https://www.instagram.com/prem_ramamoorthi/',
    linkedin: 'www.linkedin.com/in/premramamoorthy',
    github: 'https://github.com/prem-ramamoorthy',
    punch: "Prem is the CTO. If it runs in production, he has argued with it at least once.",
  },
  {
    name: 'Akash S', role: 'CSO', img: '/assets/akashimg.png', rot: -2, depth: 8,
    instagram: 'https://www.instagram.com/_._akash._.s/',
    linkedin: 'https://www.linkedin.com/in/akash-s-38603a280/',
    github: 'https://github.com/Akashwrites',
    punch: "Akash sets the strategy. He asks 'why' until the plan stops wobbling.",
  },
  {
    name: 'Narendren S V', role: 'Chief AI Engineer', img: '/assets/narendren.jpg', rot: 3, depth: 12,
    instagram: 'https://www.instagram.com/naren_170406/',
    linkedin: 'https://www.linkedin.com/in/narendren-s-v-b83418328/',
    github: 'https://github.com/Naren1704',
    punch: "Narendren does the AI. He teaches machines to make decisions — including me.",
  },
  {
    name: 'Shashanth D', role: 'Finance & Marketing Manager', img: '/assets/shashanth.jpg', rot: 0, depth: 6,
    instagram: 'https://www.instagram.com/shashanth_dt/',
    linkedin: 'www.linkedin.com/in/shashanth-dinesh-745201329/',
    github: null,
    punch: "Shashanth handles the money and the message. Both at once, somehow.",
  },
  {
    name: 'Veronica T', role: 'COO', img: '/assets/veronica.jpg', rot: 4, depth: 11,
    instagram: 'https://www.instagram.com/its.veronica.___/',
    linkedin: 'https://www.linkedin.com/in/t-veronica/',
    github: null,
    punch: "Veronica keeps the whole thing moving. Deadlines are frightened of her.",
  },
  {
    name: 'Sri Hari Hara Pandiyan', role: 'Executive Assistant', img: '/assets/sri-hari.jpg', rot: 7, depth: 9,
    instagram: 'https://www.instagram.com/dan_harxx__/',
    linkedin: 'https://www.linkedin.com/in/sri-hari-hara-pandiyan-bb3ab533b/',
    github: null,
    punch: "Sri Hari keeps the days straight. Nothing reaches the team unsorted.",
  },
]

/* Several of these were given as bare `www.linkedin.com/...`. An href without
   a scheme is a *relative path*, so the browser would send you to
   /about/www.linkedin.com/... and 404 rather than off-site. */
const link = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`)

const SOCIALS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
] as const

/* Slot order for the hero row, as indices into TEAM. The slots are size-ranked
   in AboutUs.css - .card-4 is the largest and sits dead centre, .card-3/.card-5
   flank it - so this puts the founder in the middle and the co-founder beside
   him, while TEAM itself stays in roster order for the grid below. */
const HERO_ORDER = [4, 3, 2, 0, 1, 5, 6] as const

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/* The real bitNtech journey. Order is the content here: the signal under the
   cards steps up once per entry, so adding or removing one means changing
   WAVE_PATH and the `repeat(5, ...)` grids in AboutUs.css. */
const MILESTONES = [
  {
    year: '2023',
    title: 'VR Creations',
    note: 'What started as freelancing became our first step into the world of technology. We began creating websites, software, and digital solutions for real clients while learning what it takes to build from the ground up.',
    tags: ['Freelancing', 'Web', 'Software'],
  },
  {
    year: '2024',
    title: 'From Freelancer to Builder',
    note: 'As our projects grew, so did our ambition. We moved beyond individual freelance work and started exploring bigger ideas, new technologies, and solutions we could build ourselves.',
    tags: ['Projects', 'Technology'],
  },
  {
    year: '2025',
    title: 'Building bitNtech',
    note: 'VR Creations evolved into bitNtech — a bigger vision built around creating technology, not just delivering services. We began laying the foundation for our own products and long-term innovation.',
    tags: ['bitNtech', 'Software', 'AI'],
  },
  {
    year: '2025–26',
    title: 'Into AI & Automation',
    note: 'We began turning our focus toward intelligent automation, developing AI-driven solutions that can handle real-world business operations and interactions.',
    tags: ['AI', 'Automation'],
  },
  {
    year: '2026',
    title: 'The Next Evolution',
    note: 'Today, bitNtech is moving toward a future of intelligent systems — combining AI, automation, software, embedded technology, and robotics to build products for the real world.',
    tags: ['AICA', 'Robotics', 'Systems'],
  },
] as const

/* One rising edge per milestone, at 10/30/50/70/90% of the width — the centres
   of five equal columns, so every card sits directly over its own step. The
   viewBox is 120 tall and so is the rendered box, so `y` units are px: that is
   what lets each card's stem drop to calc(90px - i * 20px) and land on its
   step. preserveAspectRatio="none" stretches it to any width. */
const WAVE_PATH = 'M0,110 H100 V90 H300 V70 H500 V50 H700 V30 H900 V10 H1000'

const STATS = [
  { count: 30, decimals: 0, suffix: '+', label: 'Projects shipped' },
  { count: 3, decimals: 0, suffix: 'yrs', label: 'Combined craft' },
  { count: 7, decimals: 0, suffix: '', label: 'Core team' },
]

export default function AboutUs() {
  /* The profile card. `null` is closed; the element that opened it is kept so
     focus can go back where it came from when it shuts. */
  const [profile, setProfile] = useState<Member | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.set('.navbar', { opacity: 0, y: -20 })
      gsap.set('.small-team .word > span', { y: '105%' })
      gsap.set('.big-results .letter', { y: 80, opacity: 0 })
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
          /* One entry per team member — seven, fanning out symmetrically. */
          const moves = [
            { x: -270, y: -40, rot: -26 },
            { x: -180, y: 40, rot: -16 },
            { x: -80, y: 110, rot: -7 },
            { x: 0, y: 130, rot: 0 },
            { x: 80, y: 110, rot: 7 },
            { x: 180, y: 40, rot: 16 },
            { x: 270, y: -40, rot: 26 },
          ]
          cards.forEach((card, i) => {
            const m = moves[i]
            const rest = parseFloat(card.dataset.restRot || '0')
            gsap.set(card, { x: m.x * p, y: m.y * p, rotation: rest + m.rot * p })
          })
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

      /* Each portrait rests at a slight tilt and unwinds to 0deg on hover, so
         the grid keeps the hero's floating-card feel without a static look.
         One fromTo rather than a to + a from: both used to write the same
         transform, and the second left every card at rotation 0. */
      const teamCards = gsap.utils.toArray<HTMLElement>('.t-card')
      teamCards.forEach((card, i) => {
        const rest = (i - (teamCards.length - 1) / 2) * 1.4
        card.dataset.restRot = String(rest)

        const enter = () => {
          gsap.to(card, { rotation: 0, y: -14, scale: 1.03, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
          /* The neighbours give way a little, which is what reads as depth. */
          teamCards.forEach((other, j) => {
            if (other === card) return
            const d = j - i
            if (Math.abs(d) > 2) return
            gsap.to(other, { x: Math.sign(d) * (8 / Math.abs(d)), duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
          })
        }
        const leave = () => {
          gsap.to(card, { rotation: rest, y: 0, scale: 1, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
          teamCards.forEach((other) => {
            if (other !== card) gsap.to(other, { x: 0, duration: 0.7, ease: 'power2.out', overwrite: 'auto' })
          })
        }
        card.addEventListener('mouseenter', enter)
        card.addEventListener('mouseleave', leave)
      })

      gsap.fromTo(
        '.t-card',
        { opacity: 0, y: 80, scale: 0.9, rotation: (i: number) => (i % 2 === 0 ? -6 : 6) },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: (_i, el) => parseFloat((el as HTMLElement).dataset.restRot || '0'),
          duration: 1,
          stagger: 0.08,
          ease: 'back.out(1.3)',
          scrollTrigger: { trigger: '.team-grid', start: 'top 80%' },
        },
      )

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

  useEffect(() => {
    if (!profile) return
    /* The page scrolls behind a fixed overlay otherwise, and on iOS the body
       keeps its momentum under the card. */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfile(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      openerRef.current?.focus()
    }
  }, [profile])

  return (
    <main className="about-us" ref={rootRef}>
      <div className="grain" />

      <section className="hero">
        <h1 className="small-team">
          <span className="word"><span>Seven</span></span>&nbsp;<span className="word"><span>minds,</span></span>
        </h1>

        <div className="big-results-wrap">
          <div className="big-results">
            {'one direction.'.split('').map((ch, i) => (
              <span className="letter" key={i}>{ch === ' ' ? ' ' : ch}</span>
            ))}
          </div>
        </div>

        <div className="cards-row">
          {HERO_ORDER.map((t): Member => TEAM[t]).map((m, i) => (
            <div key={m.name} className={`card card-${i + 1}`} data-rot={m.rot} data-depth={m.depth} title={`${m.name} — ${m.role}`}>
              {m.img ? <img src={m.img} alt={m.name} /> : <span className="card-initials" aria-hidden="true">{initials(m.name)}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="company-brief">
        <p>
          bitNtech is an engineering-driven technology company working across hardware, AI and software.
          We turn ideas into working technology — from software and intelligent systems to physical
          products and connected hardware.
        </p>
        {/* The positioning, drawn as one stack rather than three columns: these
            are connected parts of the same engineering ecosystem, not separate
            departments. */}
        <div className="triad" aria-label="Hardware, AI and software">
          <span>Hardware</span>
          <i aria-hidden="true">+</i>
          <span>AI</span>
          <i aria-hidden="true">+</i>
          <span>Software</span>
        </div>
        <p className="brief-motto">Engineering the next Evolution.</p>
      </section>

      {/* The milestones, drawn as a signal that steps up once per entry: the
          cards are the readout, the wave under them is the trace, and the rule
          at the bottom is the time axis. Replaces the row of arrow pills that
          used to sit inside the brief above. */}
      <section className="tl" aria-labelledby="tl-title">
        <div className="tl-head">
          <p className="eyebrow">From ideas to intelligent systems. — bitNtech</p>
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
                  <p>{milestone.note}</p>
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
            
            <h2>Seven people,<br />one <em>engineering team</em>.</h2>
          </div>
          <p>Every person you see here touches every project we ship. No middle layer, no handoffs to strangers — just direct work with the people doing it.</p>
        </div>

        <div className="team-grid">
          {TEAM.map((m, i) => (
            /* --t-i drives the resting tilt; hover unwinds it to 0deg. A
               button, not a div with a click handler: it is a real control, so
               it gets keyboard and screen-reader behaviour for free. */
            <button
              type="button"
              className="t-card"
              key={m.name}
              style={{ '--t-i': String(i) } as React.CSSProperties}
              aria-haspopup="dialog"
              data-nila={m.punch}
              onClick={(e) => {
                openerRef.current = e.currentTarget
                setProfile(m)
              }}
            >
              {m.img ? <img src={m.img} alt={m.name} /> : <span className="t-initials" aria-hidden="true">{initials(m.name)}</span>}
              <div className="t-meta">
                <div className="nm">{m.name}</div>
                <div className="rl">{m.role}</div>
              </div>
              <span className="t-open" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stats-inner">
          <h3>Seven humans.<br />One <em>tight ship</em>.</h3>
          {STATS.map((s) => (
            <div className="stat-block" key={s.label}>
              <div className="num" data-count={s.count}>
                <span>0</span>
                {s.decimals > 0 && <small>.{'0'.repeat(s.decimals)}</small>}
                {/* '+' is part of the figure, not a unit — it keeps the big
                    ink instead of the muted unit styling. */}
                {s.suffix && <small className={s.suffix === '+' ? 'sym' : undefined}>{s.suffix}</small>}
              </div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {profile && (
        <div className="t-modal" onClick={() => setProfile(null)}>
          <div
            className="t-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="t-modal-name"
            /* The backdrop closes; the card must not close itself when the
               click lands inside it. */
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="t-modal__x"
              ref={closeRef}
              onClick={() => setProfile(null)}
              aria-label="Close profile"
            >
              ×
            </button>

            <div className="t-modal__portrait">
              {profile.img
                ? <img src={profile.img} alt={profile.name} />
                : <span className="t-initials" aria-hidden="true">{initials(profile.name)}</span>}
            </div>

            <div className="t-modal__body">
              <p className="t-modal__role">{profile.role}</p>
              <h3 id="t-modal-name">{profile.name}</h3>

              <ul className="t-modal__links">
                {SOCIALS.map(({ key, label }) => {
                  const url = profile[key]
                  if (!url) return null
                  return (
                    <li key={key}>
                      <a href={link(url)} target="_blank" rel="noreferrer">
                        <span>{label}</span>
                        <i aria-hidden="true">↗</i>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
