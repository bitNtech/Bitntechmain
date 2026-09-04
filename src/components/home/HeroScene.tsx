import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HeroScene.css'

/**
 * The landing hero: type on the left, a luminous curled form on the right, and
 * circuit traces running out of the middle distance to land on its near edge.
 *
 * Two phases. A boot count runs 000 → 100 behind a panel, then the panel
 * splits and the type builds out of its masks, glyph by glyph, blur to sharp.
 * After that the scene is live and everything moves off four custom properties
 * set on the section — `--mx`/`--my` (eased pointer, -1..1), `--near` (0..1,
 * pointer proximity to the form) and `--sc` (0..1, scroll through the hero).
 * Every layer reads those with its own multiplier, so the parallax is one rAF
 * loop writing four numbers rather than a tween per element.
 *
 * The loop parks itself once the scene settles, and an IntersectionObserver
 * stops it dead when the hero leaves the viewport.
 */

/* The figure is /assets/hero-embryo.jpg, laid over the board in the right-hand
   half. It is screen-blended, so the black it was cut on drops out and the
   traces underneath read through its edge rather than stopping at a rectangle.
   Nothing about the board depends on it — the traces run to their own pads. */

/* ---- the board --------------------------------------------------------
   The routing is generated: straight in, one 45° elbow, straight to
   the pad. The diagonal can only consume the shorter of the two runs, so
   whichever axis still has distance left is the one the last leg travels — H
   when the horizontal run is longer, V when it is not. Getting that backwards
   leaves every steep trace ending short of its pad. */
/* Where the traces come ashore. The asset's printed bead chain used to be the
   rim; it is masked off now (see HeroScene.css), so these land a little inside
   it, on the figure's own edge — nine live nodes doing the job thirty drawn
   ones were. Taken off the mask's fitted ellipse at 94% of its radius, which
   is its last fully-opaque contour and so exactly where the form ends, and
   converted into board coordinates through the box the CSS pins the image to:
   518x680 at 1002,120 of the viewBox. That shared box is the only reason these
   meet the figure at every viewport rather than at one lucky window size. */
const PADS = [
  [1224, 331], [1172, 376], [1141, 421],
  [1124, 466], [1118, 511], [1122, 556],
  [1137, 601], [1164, 646], [1211, 691],
] as const

const TRACES = PADS.map(([px, py], i) => {
  const y0 = 90 + i * 92.5
  // Staggered bends, so the elbows form their own stepped edge rather than
  // stacking on one vertical.
  const bendX = 560 + i * 34
  const dx = px - bendX
  const dy = py - y0
  const diag = Math.min(Math.abs(dx), Math.abs(dy))
  const elbowX = bendX + Math.sign(dx) * diag
  const elbowY = y0 + Math.sign(dy) * diag
  const tail = Math.abs(dx) > Math.abs(dy) ? `H${px.toFixed(1)}` : `V${py.toFixed(1)}`

  return {
    // Starts at x=420 and fades in from nothing — see #bhTraceInk.
    d: `M420 ${y0} H${bendX} L${elbowX.toFixed(1)} ${elbowY.toFixed(1)} ${tail}`,
    px,
    py,
    // Unequal periods, or nine pulses arrive as one.
    dur: 3.4 + (i % 4) * 0.7,
    delay: i * 0.34,
  }
})

/* The loose terminators in the middle distance: short stubs that end in a dot
   and go nowhere, which is what stops the board reading as nine parallel
   lines. Decorative only. */
const STUBS = [
  { d: 'M470 240 H600', cx: 604, cy: 240 },
  { d: 'M520 706 H640', cx: 644, cy: 706 },
  { d: 'M600 148 H700 L740 188', cx: 744, cy: 192 },
  { d: 'M660 792 H760 L790 762', cx: 794, cy: 758 },
  { d: 'M440 452 H520', cx: 524, cy: 452 },
]

/* Slow motes. Random once at module load, not per render: they are set
   dressing, and re-rolling them on every render would make the field twitch. */
const DUST = Array.from({ length: 14 }, (_, i) => ({
  key: i,
  x: 52 + Math.random() * 44,
  y: 16 + Math.random() * 58,
  size: 1 + Math.random() * 2,
  dur: 20 + Math.random() * 16,
  delay: -Math.random() * 26,
  drift: -30 + Math.random() * 60,
}))

const WORD = 'Evolution'
/* The count and the panel's exit sit in front of the hero on a first visit, so
   between them they *are* the landing page's LCP — 1400 + 900 put it past six
   seconds on a throttled phone. Shortened to the same gesture at a pace that
   does not own the metric. Lengthen if the beat matters more than the number;
   every ms here lands on LCP one-for-one. */
const BOOT_MS = 850
const BOOT_OUT_MS = 560
const BOOT_KEY = 'bh-booted'

export default function HeroScene() {
  const rootRef = useRef<HTMLElement>(null)
  /* `null` means "not decided yet" — the first paint must not flash the loader
     for someone who has already seen it this session, nor skip it for someone
     who has not. */
  const [boot, setBoot] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  /* Kept mounted for the length of its exit, then dropped for good. */
  const [bootGone, setBootGone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === '1'
    } catch {
      /* Private mode throws on access; treat it as a first visit. */
    }

    if (reduced || seen) {
      setBoot(100)
      setReady(true)
      setBootGone(true)
      return
    }

    /* Counts real time rather than faking progress off load events: the scene
       is inline SVG and CSS, so there is nothing to wait for — the count is
       the beat before the reveal, and it should be honest about that. */
    const start = performance.now()
    let raf = 0
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / BOOT_MS)
      // Ease out, so it sprints and then settles on 100 instead of crawling.
      setBoot(Math.round((1 - Math.pow(1 - p, 2.2)) * 100))
      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        try {
          sessionStorage.setItem(BOOT_KEY, '1')
        } catch {
          /* Nothing to do — the loader simply plays again next time. */
        }
        setReady(true)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!ready || bootGone) return
    const id = window.setTimeout(() => setBootGone(true), BOOT_OUT_MS)
    return () => window.clearTimeout(id)
  }, [ready, bootGone])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    /* No hover, no pointer parallax. On a touch screen there is no cursor for
       the scene to lag behind, `pointermove` only fires mid-drag, and `--near`
       drives a `filter` on the hero image — so the loop was recomputing a
       filter on the largest element on the page during touch scrolling, for an
       effect nobody could see. Everything else in the hero still runs. */
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches

    /* Scroll is a position, not an animation, so it runs under reduced motion
       too — the hand-off to the section below depends on it. One frame per
       scroll burst, and only while the hero is actually on screen. */
    let onScreen = true
    let scrollFrame = 0
    const readScroll = () => {
      scrollFrame = 0
      const h = root.offsetHeight || 1
      root.style.setProperty('--sc', Math.min(1, Math.max(0, window.scrollY / h)).toFixed(4))
    }
    const onScroll = () => {
      if (!scrollFrame && onScreen) scrollFrame = requestAnimationFrame(readScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    readScroll()

    if (reduced) {
      return () => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame)
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
      }
    }

    /* Targets are written by the pointer, current values chase them at 6% a
       frame. That lag is the whole "premium" of the effect: the scene arrives
       a beat after the cursor instead of being welded to it. */
    let tmx = 0, tmy = 0, tnear = 0
    let mx = 0, my = 0, near = 0
    let raf = 0

    const readPointer = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      if (!r.width || !r.height) return
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      tmx = Math.max(-1, Math.min(1, nx))
      tmy = Math.max(-1, Math.min(1, ny))

      /* The form sits around 72% across. Distance-based rather than a hover
         state, so the board starts answering well before the cursor reaches
         it. */
      const dist = Math.hypot(nx - 0.44, (ny + 0.05) * 0.8)
      tnear = Math.max(0, 1 - dist / 0.95)
    }

    /* Parks itself when everything has settled and the pointer has stopped
       asking for anything, and is woken by the next move. An idle hero costs
       nothing. */
    const EPS = 0.0004
    let running = false
    const tick = () => {
      mx += (tmx - mx) * 0.06
      my += (tmy - my) * 0.06
      near += (tnear - near) * 0.05
      root.style.setProperty('--mx', mx.toFixed(4))
      root.style.setProperty('--my', my.toFixed(4))
      root.style.setProperty('--near', near.toFixed(4))

      const settled =
        Math.abs(tmx - mx) < EPS && Math.abs(tmy - my) < EPS && Math.abs(tnear - near) < EPS
      if (settled || !onScreen) {
        running = false
        raf = 0
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (running || !onScreen) return
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      readPointer(e)
      wake()
    }
    const onLeave = () => {
      tmx = 0
      tmy = 0
      tnear = 0
      wake()
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)

    /* The whole scene idles out of view: the CSS animations are paused by a
       class and the loop is not restarted until the hero is back. */
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        root.classList.toggle('is-off', !onScreen)
        if (onScreen) wake()
      },
      { rootMargin: '120px' },
    )
    io.observe(root)

    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className="bh" ref={rootRef} data-ready={ready ? '' : undefined} aria-labelledby="bh-head">
      {/* ---- boot ----
          aria-hidden throughout: the heading underneath is the real content
          and a screen reader should never be held at a progress number. */}
      {boot !== null && !bootGone && (
        <div className={ready ? 'bh-boot is-out' : 'bh-boot'} aria-hidden="true">
          <div className="bh-boot__inner">
            <p className="bh-boot__mark">BitN<em>Tech</em></p>
            <p className="bh-boot__meta">
              <span>Engineering systems</span>
              <span className="bh-boot__count">{String(boot).padStart(3, '0')}</span>
            </p>
            <div className="bh-boot__rail"><i style={{ transform: `scaleX(${boot / 100})` }} /></div>
          </div>
        </div>
      )}

      <div className="bh-scene" aria-hidden="true">
        <div className="bh-haze" />

        <svg className="bh-board" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <defs>

            <radialGradient id="bhCore">
              <stop offset="0" stopColor="#b9c4ee" stopOpacity=".26" />
              <stop offset="1" stopColor="#b9c4ee" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bhPadGlow">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
              <stop offset=".4" stopColor="#cfd8ff" stopOpacity=".28" />
              <stop offset="1" stopColor="#cfd8ff" stopOpacity="0" />
            </radialGradient>
            {/* The traces come out of nothing rather than off an edge. */}
            <linearGradient id="bhTraceInk" gradientUnits="userSpaceOnUse" x1="420" x2="820">
              <stop offset="0" stopColor="#d6e0ff" stopOpacity="0" />
              <stop offset="1" stopColor="#d6e0ff" stopOpacity="1" />
            </linearGradient>
          </defs>


          {/* ---- the board ---- */}
          <g className="bh-traces">
            {STUBS.map((s, i) => (
              <g key={`s${i}`}>
                <path className="bh-trace" d={s.d} pathLength="1" />
                <circle className="bh-stub" cx={s.cx} cy={s.cy} r="3" />
              </g>
            ))}
            {TRACES.map((t, i) => (
              <g key={i}>
                {/* The routing itself, drawn once on reveal and then still. */}
                <path className="bh-trace" d={t.d} pathLength="1" />
                {/* One short dash travelling the same route: the charge. */}
                <path
                  className="bh-pulse"
                  d={t.d}
                  pathLength="1"
                  style={{ animationDuration: `${t.dur}s`, animationDelay: `${t.delay}s` }}
                />
              </g>
            ))}
          </g>

        </svg>

        {/* Decorative: the headline beside it is the content. `eager` because
            it is the largest thing in the first viewport — lazily loading the
            hero's own subject only delays it. */}
        <img
          className="bh-embryo"
          src="/assets/hero-embryo.jpg"
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="522"
          height="692"
        />

        {/* The far end of the board, in front of the figure. Same viewBox and
            the same parallax offset as the traces behind it, so each node stays
            welded to the line that feeds it — the line just happens to pass
            under the embryo on its way here. */}
        <svg className="bh-board bh-board--fore" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          {/* #bhPadGlow is defined in the board above; refs are document-wide. */}
          <g className="bh-pads">
            {TRACES.map((t, i) => (
              <g key={i} style={{ animationDelay: `${t.delay}s` }}>
                <circle className="bh-pad__halo" cx={t.px} cy={t.py} r="20" fill="url(#bhPadGlow)" />
                <circle className="bh-pad__ring" cx={t.px} cy={t.py} r="6.5" />
                <circle className="bh-pad__core" cx={t.px} cy={t.py} r="2.6" />
              </g>
            ))}
          </g>
        </svg>

        <div className="bh-dust">
          {DUST.map((d) => (
            <span
              key={d.key}
              style={
                {
                  '--x': `${d.x}%`,
                  '--y': `${d.y}%`,
                  '--s': `${d.size}px`,
                  '--dur': `${d.dur}s`,
                  '--delay': `${d.delay}s`,
                  '--drift': `${d.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Keeps the left column dark enough to hold type over the traces. */}
        <div className="bh-vignette" />
      </div>

      {/* ---- left column: everything that is read ---- */}
      <div className="bh-copy">
        <h1 className="bh-head" id="bh-head">
          <span className="bh-line bh-line--1">
            <span className="bh-line__in" style={{ '--i': .8 } as React.CSSProperties}>Engineering</span>
          </span>
          <span className="bh-line bh-line--2">
            <span className="bh-line__in" style={{ '--i': 1.5 } as React.CSSProperties}>the next</span>
          </span>
          <span className="bh-word">
            {/* The glyphs are decoration once they are split; this carries the
                word for a reader, since a bare aria-label on a <span> with no
                role is not reliably announced. */}
            <span className="bh-sr">{WORD}</span>
            {WORD.split('').map((ch, i) => (
              <span className="bh-glyph" key={i} style={{ '--i': 2.4 + i * 0.4 } as React.CSSProperties} aria-hidden="true">{ch}</span>
            ))}
          </span>
        </h1>

        <p className="bh-span">
          <span className="bh-line__in" style={{ '--i': 6.4 } as React.CSSProperties}>Hardware · AI · Software</span>
        </p>

        <div className="bh-actions">
          {/* The label is set twice and the pair slides: the first copy leaves
              upward as the second arrives, so the button reads as a mechanism
              rather than a colour change. The arrow flies out right and a
              second one enters from the left behind it. */}
          <a className="bh-btn bh-btn--go" href="#solutions">
            <span className="bh-btn__wash" aria-hidden="true" />
            <span className="bh-btn__swap">
              <span>Explore what we build</span>
              <span aria-hidden="true">Explore what we build</span>
            </span>
            <span className="bh-btn__fly" aria-hidden="true">
              <i>→</i>
              <i>→</i>
            </span>
          </a>

          {/* The site annotates everything in brackets; this one is a bracket
              that opens. They spread, the rule under the label draws in. */}
          <Link className="bh-btn bh-btn--bracket" to="/contact">
            <b aria-hidden="true">[</b>
            <span className="bh-btn__swap">
              <span>Start a project</span>
              <span aria-hidden="true">Start a project</span>
            </span>
            <b aria-hidden="true">]</b>
          </Link>
        </div>
      </div>

      {/* ---- the furniture ---- */}
      <div className="bh-rail" aria-hidden="true"><i /></div>

      <p className="bh-mark" aria-hidden="true">
        <span>BitNTech</span>
        <span>Engineering Systems</span>
      </p>

      <div className="bh-cross" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
        </svg>
        <i />
      </div>

      <div className="bh-claim">
        <p className="bh-claim__head">Turn your idea<br />into working<br />technology</p>
        <Link className="bh-claim__go" to="/contact">
          <span>Start a project</span>
          <i aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
