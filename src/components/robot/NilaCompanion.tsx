import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NilaScene from './NilaScene'
import { useNilaTalk } from './useNilaTalk'
import { besideBox, explainLine, perch, rails, routeEvent } from './nilaBrain'
import type { NilaEvent, NilaMood } from './nilaBrain'
import { matchFaq } from '../chat/chatFaq'
import './Nila.css'

const HALF = 42
/* Chrome she should never try to explain — she reads content, not furniture. */
const FURNITURE = 'header, footer, nav, .nila-companion'

/* `line`, when present, is a written line the element handed her through
   `data-nila` — see the team cards in AboutUs.tsx. Most boxes have none and
   she builds a line out of their own copy instead; a card whose whole content
   is a name and a job title has nothing worth building from, so it says what
   it wants said. */
type Box = { el: HTMLElement; title: string; body: string; points: string[]; line?: string }

function readBox(heading: Element): Box {
  // The box is the card the heading sits in — but a heading whose card is most
  // of the page has no card, so it speaks for itself.
  const card = (heading.closest('a, li, article') as HTMLElement) ?? (heading.parentElement as HTMLElement) ?? (heading as HTMLElement)
  const el = card.getBoundingClientRect().height > window.innerHeight * 0.7 ? (heading as HTMLElement) : card
  // Whatever the card lists about itself: those specifics are better than any
  // example she could invent for it.
  const points = [...el.querySelectorAll('li')]
    .map((li) => (li.textContent ?? '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 2 && t.length < 90)
    .slice(0, 3)
  return {
    el,
    title: heading.textContent ?? '',
    body: el.querySelector('p')?.textContent ?? '',
    points,
    line: el.dataset.nila || (card.dataset.nila ?? undefined),
  }
}

/** A box that carries its own line and needs no heading to be found. */
function readScripted(el: HTMLElement): Box {
  return { el, title: '', body: '', points: [], line: el.dataset.nila }
}

/** Every titled box currently on screen. */
function visibleBoxes(): Box[] {
  const seen = new Set<HTMLElement>()
  const out: Box[] = []
  const onScreen = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    return rect.bottom >= window.innerHeight * 0.15 && rect.top <= window.innerHeight * 0.85
  }
  const collect = (box: Box) => {
    if (seen.has(box.el) || !onScreen(box.el)) return
    seen.add(box.el)
    out.push(box)
  }
  for (const heading of document.querySelectorAll('section h2, section h3')) {
    if (heading.closest(FURNITURE)) continue
    collect(readBox(heading))
  }
  // Anything that wrote its own line joins the tour on the same terms.
  for (const el of document.querySelectorAll<HTMLElement>('[data-nila]')) {
    if (el.closest(FURNITURE)) continue
    collect(readScripted(el))
  }
  return out
}

/* The "stop yapping" dock: a panel on the right edge of the screen. It slides
   out while she is being dragged; drop her on it and she hangs from its hook,
   sulking, until tapped. She takes it personally — sad face, the odd wistful
   whisper. Remembered across reloads, so a parked Nila stays parked. */
const DOCK_KEY = 'nila-docked'
/* How close to the hook a drop has to land, in px. Generous on purpose: a
   finger dragging her covers her up, so aiming is half guesswork. */
const DOCK_SNAP = 90
/** How far below the panel's top edge she hangs. Matches .nila-dock in CSS. */
const DOCK_HANG = 68
/** Seconds between sulky whispers while she is docked. */
const SIGH_EVERY = 32000

/** Where she hangs: centred in the panel (58px, or 44px on a phone, where it
    sits over content), low enough to stay off the hero, clear of the foot. */
function dockPoint() {
  const w = window.innerWidth
  const h = window.innerHeight
  const half = w <= 560 ? 22 : 29
  /* Her box shrinks on smaller screens (see Nila.css) but is always placed as
     if it were 84px, so its visual centre sits left of `x` by the difference. */
  const size = w <= 560 ? 56 : w <= 860 ? 68 : 84
  return { x: w - half + (HALF - size / 2), y: Math.round(Math.min(h * 0.58, h - 110)) }
}

function readDocked(): boolean {
  try {
    return localStorage.getItem(DOCK_KEY) === '1'
  } catch {
    return false
  }
}

function writeDocked(on: boolean) {
  try {
    if (on) localStorage.setItem(DOCK_KEY, '1')
    else localStorage.removeItem(DOCK_KEY)
  } catch {
    // Storage blocked: she stays docked for this visit only.
  }
}

/** The box under a point, ignoring Nila herself — used when you drop her. */
function boxAt(x: number, y: number): Box | null {
  const under = document.elementsFromPoint(x, y).find((el) => !el.closest('.nila-companion') && !el.closest(FURNITURE))
  const heading = under?.closest('a, li, article, section')?.querySelector('h1, h2, h3')
  return heading ? readBox(heading) : null
}

/**
 * The Nila that shows you around. She flies to whichever box you have scrolled
 * to and explains it in its own words; you can pick her up and drop her on
 * something else to hear about that instead, or click her and type a question.
 */
export default function NilaCompanion() {
  const { pathname } = useLocation()
  const [awake, setAwake] = useState(false)
  const [target, setTarget] = useState<Box | null>(null)
  const [pinned, setPinned] = useState(false)
  const [asking, setAsking] = useState(false)
  const [question, setQuestion] = useState('')
  // The last question and what she said back — one exchange, shown as two
  // bubbles over her head. A scrolling transcript would be a chat window, and
  // the whole point is that she answers where she stands.
  const [exchange, setExchange] = useState<{ q: string; a: string } | null>(null)
  // Her small talk stays rare: what she has to say is on the page in front of
  // her, not in a canned rotation.
  const [docked, setDocked] = useState(readDocked)
  /* A film is playing (the AICA ad on /products). She steps out of frame
     until it stops: talking over a video with sound is rude, and her WebGL
     scene competes with the decoder on weaker devices. Media events do not
     bubble, so this listens in the capture phase. */
  const [filmPlaying, setFilmPlaying] = useState(false)
  useEffect(() => {
    const on = (e: Event) => { if (e.target instanceof HTMLVideoElement) setFilmPlaying(true) }
    const off = (e: Event) => { if (e.target instanceof HTMLVideoElement) setFilmPlaying(false) }
    document.addEventListener('play', on, true)
    document.addEventListener('pause', off, true)
    document.addEventListener('ended', off, true)
    return () => {
      document.removeEventListener('play', on, true)
      document.removeEventListener('pause', off, true)
      document.removeEventListener('ended', off, true)
    }
  }, [])
  // What she opens with when she next wakes: a greeting, or relief at being let out.
  const [wakeEvent, setWakeEvent] = useState<NilaEvent>('greet')
  // No small talk from the dock — only the whispers scheduled below.
  const { text, mood, nudging, say, sayText } = useNilaTalk(awake && !docked && !filmPlaying, wakeEvent, 45000)
  // Set by dock(), so the first line in the dock is the sulk, not a whisper.
  const justDocked = useRef(false)
  // Whether the last drag frame was over the dock, and when she last protested.
  const nearDock = useRef({ on: false, said: -Infinity })
  // Read by the route and scroll handlers without re-subscribing them.
  const dockedRef = useRef(docked)
  useEffect(() => {
    dockedRef.current = docked
  }, [docked])
  // The dock is only on screen while she is held, or while she is in it.
  const [dragging, setDragging] = useState(false)
  const [overDock, setOverDock] = useState(false)
  const [pos, setPos] = useState(() => (readDocked() ? dockPoint() : perch(pathname, { w: window.innerWidth, h: window.innerHeight })))
  // Which way she is turned, and whether she is mid-trip: both are body
  // language, so they belong to the model rather than to the layout.
  const [facing, setFacing] = useState(0)
  const [travelling, setTravelling] = useState(false)
  const speech = useRef<HTMLDivElement>(null)
  const [vside, setVside] = useState<'above' | 'below'>('above')
  const el = useRef<HTMLDivElement>(null)
  const from = useRef(pos)
  const drag = useRef({ active: false, moved: false })
  // Shake detection: the last turning point, which way she is being swung, and
  // how many times that has reversed inside the current window.
  const shake = useRef({ anchor: 0, dir: 0, turns: 0, since: 0, last: 0 })
  const toured = useRef(new Set<HTMLElement>())
  // False until she has walked on screen once — a fresh page, or a new route.
  const entered = useRef(false)

  const explain = useCallback((box: Box, tone: NilaMood = 'happy') => {
    // A written line wins: nothing generated from a name and a job title is
    // going to beat one somebody wrote for that person.
    const line = box.line ?? explainLine(box.title, box.body, box.points)
    if (line) sayText(line, tone)
  }, [sayText])

  // A new route resets the tour — unless she is docked, where she stays put.
  useEffect(() => {
    if (dockedRef.current) return
    setAwake(false)
    setWakeEvent('greet')
    setPinned(false)
    setTarget(null)
    setExchange(null)
    setAsking(false)
    toured.current.clear()
    setPos(perch(pathname, { w: window.innerWidth, h: window.innerHeight }))
    const event = routeEvent(pathname)
    if (!event) return
    const t = window.setTimeout(() => say(event), 1500)
    return () => window.clearTimeout(t)
  }, [pathname, say])

  // The tour: whichever titled box is nearest the middle of the screen and has
  // not had its turn yet. No new box means she stays put — every move of hers
  // goes somewhere specific, rather than just somewhere.
  useEffect(() => {
    if (pinned || asking || docked) return
    const middleOf = (box: Box) => {
      const r = box.el.getBoundingClientRect()
      return Math.abs((r.top + r.bottom) / 2 - window.innerHeight / 2)
    }
    const look = () => {
      const next = visibleBoxes()
        .filter((box) => !toured.current.has(box.el))
        .sort((a, b) => middleOf(a) - middleOf(b))[0]
      if (!next) return
      setAwake(true)
      toured.current.add(next.el)
      setTarget(next)
    }
    look()
    const id = window.setInterval(look, 5200)
    // She should be waiting for you when you stop scrolling, not up to a whole
    // interval later — but mid-scroll is the wrong moment to pick a target.
    let settle: number
    const onScroll = () => {
      window.clearTimeout(settle)
      settle = window.setTimeout(look, 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearInterval(id)
      window.clearTimeout(settle)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname, pinned, asking, docked])

  // Dropped and staying put: she explains whatever scrolls under her, and lets
  // herself go once the thing you pinned her to has left the screen entirely —
  // which is also the only way back to the tour without a button for it.
  useEffect(() => {
    if (!pinned) return
    let settle: number
    const look = () => {
      const under = boxAt(pos.x, pos.y)
      if (!under) {
        const held = target?.el.getBoundingClientRect()
        if (!held || held.bottom < 0 || held.top > window.innerHeight) setPinned(false)
        return
      }
      if (under.el === target?.el) return
      setTarget(under)
      explain(under, 'watching')
    }
    const onScroll = () => {
      window.clearTimeout(settle)
      settle = window.setTimeout(look, 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(settle)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pinned, pos, target, explain])

  // Fly to the box, then explain it — arriving and talking at once reads as
  // teleporting rather than walking over.
  useEffect(() => {
    if (!target || pinned) return
    setPos(besideBox(target.el.getBoundingClientRect(), { w: window.innerWidth, h: window.innerHeight }))
    const t = window.setTimeout(() => explain(target), 1300)
    return () => window.clearTimeout(t)
  }, [target, pinned, explain])

  useEffect(() => {
    const onResize = () => {
      if (docked) setPos(dockPoint())
      else if (target && !pinned) setPos(besideBox(target.el.getBoundingClientRect(), { w: window.innerWidth, h: window.innerHeight }))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [target, pinned, docked])

  // She is only ever off screen between routes, and she has to walk back on.
  useEffect(() => {
    if (!awake) entered.current = false
  }, [awake])

  /* She reacts to you going for the button before you press it: reaching a
     call to action gets an egging-on and a wave, landing in a form field gets
     her reading over your shoulder. Delegated from the document, so it covers
     every CTA on every route without each one having to opt in — and rate
     limited, because a nudge every time the pointer crosses a link is not a
     character, it is a fly. */
  useEffect(() => {
    if (pinned || asking || docked) return
    const CTA = 'a[href="/contact"], .nila-bubble__cta, .nav-05__cta'
    const FIELD = 'form input, form textarea, form select'
    let last = 0
    const react = (event: NilaEvent) => {
      const now = Date.now()
      if (now - last < 9000) return
      last = now
      say(event)
    }
    const onOver = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.(CTA)) react('cta-near')
    }
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest?.(CTA)) react('cta-near')
      else if (target?.matches?.(FIELD)) react('form-focus')
    }
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('focusin', onFocus)
    }
  }, [pinned, asking, docked, say])

  /* Her speech sits above her head, which puts it off the top of the screen
     whenever she perches high — the tour parks her within a rail's width of
     the top edge, and the fixed header covers what is left. So measure what
     she is actually saying and put it under her when it will not fit above.
     Measured, not assumed: one line of greeting and a five-line explanation
     need very different amounts of room. */
  useLayoutEffect(() => {
    const node = speech.current
    if (!node) return
    const height = node.offsetHeight
    if (!height) return
    // Clear of the fixed header, which would otherwise cover the bubble.
    const headroom = window.innerWidth < 860 ? 64 : 76
    const roomAbove = pos.y - HALF - height - headroom
    const roomBelow = window.innerHeight - (pos.y + HALF + height) - 16
    // Below only when above genuinely does not fit and below does better.
    setVside(roomAbove < 0 && roomBelow > roomAbove ? 'below' : 'above')
  }, [pos.y, text, asking, exchange])

  // The flight: one arc that bows above the straight line, timed by distance.
  // Dragging is exempt — under your finger she has to be where you put her.
  useLayoutEffect(() => {
    const node = el.current
    let start = from.current
    from.current = pos
    if (!node || drag.current.active) return

    const edge = window.innerWidth
    // First appearance on a page: she comes in off the near edge rather than
    // materialising, so arriving is a move like every other move she makes.
    if (!entered.current) start = { x: pos.x > edge / 2 ? edge + HALF * 3 : -HALF * 3, y: pos.y }
    // A whole screen further down is not a hop across the page — she drops in
    // from above, as if she had followed you out of the section you just left.
    else if (pos.y - start.y > window.innerHeight * 0.5) start = { x: pos.x, y: -HALF * 3 }
    entered.current = true

    // Any path that does not start a flight has to land the lean, or she stays
    // banked over forever on the one trip that got interrupted.
    const inward = pos.x > edge / 2 ? -1 : 1
    if (start.x === pos.x && start.y === pos.y) {
      setTravelling(false)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTravelling(false)
      setFacing(inward)
      return
    }
    const dx = pos.x - start.x
    const dy = pos.y - start.y
    const travel = Math.hypot(dx, dy)
    // She turns to face where she is going, then turns back in toward the page
    // once she lands — never sliding sideways while facing forward.
    setFacing(Math.abs(dx) > 40 ? Math.sign(dx) : inward)
    setTravelling(true)
    const lift = Math.min(travel * 0.28, 190)
    // The bow is perpendicular to the trip and always toward the middle of the
    // screen, so sliding down a rail swims inward instead of overshooting.
    const mid = { x: (start.x + pos.x) / 2, y: (start.y + pos.y) / 2 }
    const bowIn = mid.x > edge / 2 ? -1 : 1
    const bow = { x: (-dy / travel) * lift, y: (dx / travel) * lift }
    const sign = Math.sign(bow.x) === bowIn || bow.x === 0 ? 1 : -1
    const at = (x: number, y: number, s: number) => ({ transform: `translate(${x - HALF}px, ${y - HALF}px) scale(${s})` })
    const flight = node.animate(
      [at(start.x, start.y, 1), at(mid.x + bow.x * sign, mid.y + bow.y * sign, 0.86), at(pos.x, pos.y, 1)],
      { duration: Math.min(900 + travel * 1.1, 2200), easing: 'cubic-bezier(.45,.05,.35,1)' },
    )
    flight.onfinish = () => {
      setTravelling(false)
      setFacing(inward)
    }
    return () => flight.cancel()
  }, [pos])

  /* Easter egg: fling the page and she gets motion sick. Sampled on a floor of
     60ms so a burst of scroll events cannot divide by nearly zero, and put on a
     long cooldown — a gag that fires every flick stops being one. */
  useEffect(() => {
    let at = window.scrollY
    let when = performance.now()
    let last = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - when < 60) return
      const speed = Math.abs(window.scrollY - at) / (now - when)
      at = window.scrollY
      when = now
      if (speed > 4.5 && now - last > 25000 && !dockedRef.current) {
        last = now
        say('headrush')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [say])

  /* In the dock: one sulk on arrival (or a whisper a little later, when she
     was already docked on page load), then a wistful line every half minute.
     Never more — the dock is the "stop yapping" button, after all. */
  useEffect(() => {
    if (!docked) return
    const event: NilaEvent = justDocked.current ? 'dock-in' : 'docked'
    const first = window.setTimeout(() => say(event), justDocked.current ? 1300 : 7000)
    justDocked.current = false
    const sigh = window.setInterval(() => say('docked'), SIGH_EVERY)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(sigh)
    }
  }, [docked, say])

  const dock = () => {
    writeDocked(true)
    justDocked.current = true
    setDocked(true)
    setPinned(false)
    setAsking(false)
    setExchange(null)
    setTarget(null)
    setPos(dockPoint())
  }

  const release = () => {
    writeDocked(false)
    setWakeEvent('undock')
    setDocked(false)
    setAwake(true)
  }

  const undock = () => {
    release()
    toured.current.clear()
    setPos(perch(pathname, { w: window.innerWidth, h: window.innerHeight }))
  }

  // Enter or Space on her does what a tap does. Pointer taps arrive through
  // the pointer handlers below, so only keyboard clicks (detail 0) land here.
  const onKeyboardClick = (e: React.MouseEvent) => {
    if (e.detail !== 0) return
    if (docked) undock()
    else setAsking((open) => !open)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, moved: false }
    shake.current = { ...shake.current, anchor: e.clientX, dir: 0, turns: 0, since: performance.now() }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  /* Easter egg: swing her back and forth while you are holding her and she
     gets shaken about. A reversal only counts once the swing has covered 22px,
     or the hand tremor of holding still would read as a shake. */
  const trackShake = (x: number) => {
    const s = shake.current
    const swing = x - s.anchor
    if (Math.abs(swing) < 22) return
    const dir = Math.sign(swing)
    s.anchor = x
    if (dir === s.dir) return
    const now = performance.now()
    if (now - s.since > 1400) {
      s.turns = 0
      s.since = now
    }
    s.dir = dir
    s.turns += 1
    if (s.turns >= 4 && now - s.last > 8000) {
      s.last = now
      s.turns = 0
      say('shaken')
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    // A few pixels of slop, or every click registers as a one-pixel drag —
    // and a finger is never as still as a mouse, so it takes more than a cursor.
    const slop = e.pointerType === 'mouse' ? 8 : 14
    if (!drag.current.moved && Math.hypot(e.clientX - pos.x, e.clientY - pos.y) < slop) return
    if (!drag.current.moved) setDragging(true)
    drag.current.moved = true
    trackShake(e.clientX)
    const d = dockPoint()
    const near = Math.hypot(e.clientX - d.x, e.clientY - d.y) < DOCK_SNAP
    // Carried over the dock she sees where this is going, and protests once.
    if (near && !nearDock.current.on && !docked && performance.now() - nearDock.current.said > 8000) {
      nearDock.current.said = performance.now()
      say('dock-near')
    }
    nearDock.current.on = near
    setOverDock(near)
    // Same rails the perches obey, or a drag parks her (and her bubble) half
    // off the screen edge.
    const { side, floor } = rails({ w: window.innerWidth, h: window.innerHeight })
    setPos({
      x: Math.min(Math.max(e.clientX, side), window.innerWidth - side),
      y: Math.min(Math.max(e.clientY, side), window.innerHeight - floor),
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dragged = drag.current.moved
    drag.current = { active: false, moved: false }
    setDragging(false)
    setOverDock(false)
    nearDock.current.on = false
    if (!dragged && docked) {
      undock()
      return
    }
    if (dragged) {
      const d = dockPoint()
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < DOCK_SNAP) {
        dock()
        return
      }
      // Pulled out of the dock by hand: awake, and staying where she was put.
      if (docked) release()
    }
    if (!dragged) {
      // One click opens the ask bubble, the next puts her back on the tour.
      setAsking((open) => {
        if (open) {
          setExchange(null)
          setQuestion('')
        }
        return !open
      })
      return
    }
    // Dropped somewhere: she stays there and explains what she landed on.
    setPinned(true)
    const box = boxAt(e.clientX, e.clientY)
    if (box) {
      setTarget(box)
      explain(box, 'watching')
    }
    else sayText('Nothing to read here. Drop me on a card and I will explain it.', 'thinking')
  }

  const ask = (e: React.FormEvent) => {
    e.preventDefault()
    const asked = question.trim()
    if (!asked) return
    const reply = matchFaq(asked)
    setQuestion('')
    // A beat of thinking before the reply — the face changes with it, so she
    // reads as looking it up rather than echoing you back instantly.
    setExchange({ q: asked, a: '' })
    sayText('', 'thinking', 900)
    window.setTimeout(() => {
      setExchange({ q: asked, a: reply.answer })
      sayText(reply.answer, reply.mood as NilaMood)
    }, 420)
  }

  if ((!awake && !docked) || filmPlaying) return null

  const resting = docked && !dragging

  return (
    <>
    {(dragging || docked) && (
      <div
        className={`nila-dock${overDock ? ' is-near' : ''}${resting ? ' is-docked' : ''}`}
        style={{ top: dockPoint().y - DOCK_HANG }}
        aria-hidden="true"
      >
        <span className="nila-dock__hook" />
        <span className="nila-dock__label">{resting ? 'Sulking' : <>Stop<br />yapping</>}</span>
        <span className="nila-dock__row">
          {/* A muted speaker: the one thing this panel is for. */}
          <svg className="nila-dock__mute" viewBox="0 0 24 24">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="m16 9 5 6m0-6-5 6" />
          </svg>
          <span className="nila-dock__lamp" />
        </span>
      </div>
    )}
    <div
      ref={el}
      className={`nila-companion${pinned ? ' is-pinned' : ''}${resting ? ' is-docked' : ''}`}
      data-side={pos.x > window.innerWidth / 2 ? 'right' : 'left'}
      data-vside={vside}
      style={{ left: 0, top: 0, transform: `translate(${pos.x - HALF}px, ${pos.y - HALF}px)` }}
    >
      {asking ? (
        <div className="nila-ask" ref={speech}>
          {exchange && (
            <>
              <p className="nila-ask__said">{exchange.q}</p>
              <output className="nila-ask__answer">{exchange.a || '…'}</output>
            </>
          )}
          <form onSubmit={ask}>
            <input
              autoFocus
              className="nila-ask__input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything…"
              aria-label="Ask Nila a question"
              enterKeyHint="send"
              autoComplete="off"
            />
            {/* Enter still sends. This is the same action for anyone who does
                not have a keyboard in front of them, or does not know to try. */}
            <button
              type="submit"
              className="nila-ask__send"
              aria-label="Send question"
              disabled={!question.trim()}
            >
              <span aria-hidden="true">↑</span>
            </button>
          </form>
        </div>
      ) : (
        <div
          ref={speech}
          /* Nothing is said mid-flight. The trip arcs above the straight line
             and can start from off screen, so a bubble left on during it rides
             out of the viewport with her — which is how a message ends up
             invisible. It also just reads better: she lands, then talks. */
          className={`nila-bubble${text && !travelling ? ' is-on' : ''}${nudging ? ' is-nudge' : ''}${docked ? ' is-whisper' : ''}`}
          role="status"
          // Her sighs from the dock are atmosphere, not news.
          aria-live={docked ? 'off' : 'polite'}
        >
          <span>{text}</span>
        </div>
      )}
      {/* Her own little weather while she sulks. */}
      {resting && <span className="nila-cloud" aria-hidden="true"><i /><i /><i /></span>}
      <div className="nila-companion__float">
        {/* Sad in the dock, and already sad on the way into it. Looking back
            toward the page she has been sent away from. */}
        <NilaScene
          mood={docked || overDock ? 'sad' : mood}
          waving={!docked && nudging}
          facing={resting ? -1 : facing}
          travelling={travelling}
        />
      </div>
      <button
        type="button"
        className="nila-companion__hit"
        aria-label={
          docked ? 'Nila is sulking in the stop-yapping dock. Bring her back'
            : asking ? 'Close the chat and let Nila carry on explaining'
              : 'Ask Nila a question, or drag her onto something for her to explain, or onto the stop-yapping dock at the screen edge to quiet her'
        }
        onClick={onKeyboardClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {/* Dragging is the way to the dock for a pointer; this is the way for
          a keyboard. Invisible until focused. */}
      {!docked && (
        <button type="button" className="nila-companion__dockbtn" onClick={dock}>
          Send Nila to the stop-yapping dock
        </button>
      )}
    </div>
    </>
  )
}
