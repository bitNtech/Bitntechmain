import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import NilaScene from './NilaScene'
import { useNilaTalk } from './useNilaTalk'
import { besideBox, explainLine, perch, rails, routeEvent } from './nilaBrain'
import type { NilaMood } from './nilaBrain'
import { matchFaq } from '../chat/chatFaq'
import './Nila.css'

const HALF = 42
/* Chrome she should never try to explain — she reads content, not furniture. */
const FURNITURE = 'header, footer, nav, .nila-companion, .navbar, .bottom-nav'

type Box = { el: HTMLElement; title: string; body: string; points: string[] }

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
  return { el, title: heading.textContent ?? '', body: el.querySelector('p')?.textContent ?? '', points }
}

/** Every titled box currently on screen. */
function visibleBoxes(): Box[] {
  const seen = new Set<HTMLElement>()
  const out: Box[] = []
  for (const heading of document.querySelectorAll('section h2, section h3')) {
    if (heading.closest(FURNITURE)) continue
    const box = readBox(heading)
    if (seen.has(box.el)) continue
    const rect = box.el.getBoundingClientRect()
    if (rect.bottom < window.innerHeight * 0.15 || rect.top > window.innerHeight * 0.85) continue
    seen.add(box.el)
    out.push(box)
  }
  return out
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
  const { text, mood, nudging, say, sayText } = useNilaTalk(awake, 'greet', 45000)
  const [pos, setPos] = useState(() => perch(pathname, { w: window.innerWidth, h: window.innerHeight }))
  // Which way she is turned, and whether she is mid-trip: both are body
  // language, so they belong to the model rather than to the layout.
  const [facing, setFacing] = useState(0)
  const [travelling, setTravelling] = useState(false)
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
    const line = explainLine(box.title, box.body, box.points)
    if (line) sayText(line, tone)
  }, [sayText])

  // A new route resets the tour.
  useEffect(() => {
    setAwake(false)
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
    if (pinned || asking) return
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
  }, [pathname, pinned, asking])

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
      if (target && !pinned) setPos(besideBox(target.el.getBoundingClientRect(), { w: window.innerWidth, h: window.innerHeight }))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [target, pinned])

  // She is only ever off screen between routes, and she has to walk back on.
  useEffect(() => {
    if (!awake) entered.current = false
  }, [awake])

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
      if (speed > 4.5 && now - last > 25000) {
        last = now
        say('headrush')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [say])

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
    drag.current.moved = true
    trackShake(e.clientX)
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

  if (!awake) return null

  return (
    <div
      ref={el}
      className={`nila-companion${pinned ? ' is-pinned' : ''}`}
      data-side={pos.x > window.innerWidth / 2 ? 'right' : 'left'}
      style={{ left: 0, top: 0, transform: `translate(${pos.x - HALF}px, ${pos.y - HALF}px)` }}
    >
      {asking ? (
        <div className="nila-ask">
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
        <div className={`nila-bubble${text ? ' is-on' : ''}${nudging ? ' is-nudge' : ''}`} role="status" aria-live="polite">
          <span>{text}</span>
        </div>
      )}
      <div className="nila-companion__float">
        <NilaScene mood={mood} waving={nudging} facing={facing} travelling={travelling} />
      </div>
      <button
        type="button"
        className="nila-companion__hit"
        aria-label={asking ? 'Close the chat and let Nila carry on explaining' : 'Ask Nila a question, or drag her onto something for her to explain'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}
