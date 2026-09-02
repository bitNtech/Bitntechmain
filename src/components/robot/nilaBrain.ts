/* What Nila says and feels. Kept free of React and three so the scheduling
   rules can be checked without a browser — see nilaBrain.test.ts. */

export type NilaMood = 'idle' | 'happy' | 'excited' | 'watching' | 'thinking' | 'success' | 'dizzy'

export type NilaLine = { text: string; mood: NilaMood; ms?: number }

/** Everything that can make Nila speak. */
export type NilaEvent =
  | 'greet'
  | 'idle'
  | 'nudge'
  | 'deep-scroll'
  | 'headrush'
  | 'shaken'
  | 'cta-near'
  | 'form-focus'
  | 'form-sent'
  | 'route:/'
  | 'route:/about'
  | 'route:/contact'
  | 'route:/software'
  | 'route:/hardware'

const LINES: Partial<Record<NilaEvent, NilaLine[]>> & { idle: NilaLine[] } = {
  greet: [
    { text: "Hi, I'm Nila. I live here.", mood: 'happy' },
    { text: 'Oh good, someone came by.', mood: 'happy' },
    { text: 'Hey! Want the tour?', mood: 'excited' },
  ],
  idle: [
    { text: 'Take your time. I like the view.', mood: 'idle' },
    { text: 'Everything here, we actually built.', mood: 'idle' },
    { text: 'Ask me anything — I do read the questions.', mood: 'watching' },
    { text: 'Software, hardware, and the awkward bit in between.', mood: 'idle' },
    { text: 'Still here. Still floating.', mood: 'idle' },
    { text: "That scroll bar isn't going to move itself.", mood: 'happy' },
  ],
  nudge: [
    { text: 'Psst — Get Started is right there.', mood: 'excited', ms: 6000 },
    { text: 'One click on Get Started and I fetch a human.', mood: 'excited', ms: 6000 },
    { text: 'You could just tell us the idea. Get Started.', mood: 'happy', ms: 6000 },
    { text: "Not to nag, but Get Started is the fun button.", mood: 'excited', ms: 6000 },
  ],
  'deep-scroll': [
    { text: "You've made it far. I'm impressed.", mood: 'happy' },
    { text: 'Still reading? Respect.', mood: 'excited' },
  ],
  headrush: [
    { text: 'Whoa — the room is still spinning.', mood: 'dizzy', ms: 4200 },
    { text: 'Ow. My gyros. Slow down a bit?', mood: 'dizzy', ms: 4200 },
    { text: 'I felt that scroll in my neck bolts.', mood: 'dizzy', ms: 4200 },
  ],
  shaken: [
    { text: "Okay — okay! I'm a robot, not a snow globe.", mood: 'dizzy', ms: 4600 },
    { text: 'Everything is sideways. Thanks for that.', mood: 'dizzy', ms: 4600 },
    { text: 'Shaken. Not stirred. Still dizzy.', mood: 'dizzy', ms: 4600 },
  ],
  'cta-near': [
    { text: 'Yes. That one. Press it.', mood: 'excited', ms: 4000 },
    { text: 'Go on, I dare you.', mood: 'excited', ms: 4000 },
  ],
  'form-focus': [
    { text: "I'm reading over your shoulder. Politely.", mood: 'watching' },
    { text: 'Tell us the messy version, we like those.', mood: 'watching' },
  ],
  'form-sent': [
    { text: 'Sent! A real human takes it from here.', mood: 'success', ms: 7000 },
  ],
  'route:/': [{ text: 'Home. Mind the giant letters.', mood: 'happy' }],
  'route:/about': [{ text: 'Eight of us. I count as staff.', mood: 'happy' }],
  'route:/contact': [{ text: "Right — let's swap details.", mood: 'excited' }],
  'route:/software': [{ text: 'Software. My favourite half.', mood: 'happy' }],
  'route:/hardware': [{ text: 'Hardware. Where things get physical.', mood: 'excited' }],
}

export const DEFAULT_MS = 5200

/** Picks a line for an event, avoiding the one just spoken where it can. */
export function pickLine(event: NilaEvent, lastText?: string): NilaLine {
  const pool = LINES[event] ?? LINES.idle
  const fresh = pool.filter((l) => l.text !== lastText)
  const from = fresh.length ? fresh : pool
  return from[Math.floor(Math.random() * from.length)]
}

/** Every Nth idle beat becomes a Get Started nudge instead of small talk. */
export const NUDGE_EVERY = 3

export function idleEvent(idleCount: number): NilaEvent {
  return idleCount > 0 && idleCount % NUDGE_EVERY === 0 ? 'nudge' : 'idle'
}

export function routeEvent(pathname: string): NilaEvent | null {
  const key = `route:${pathname}` as NilaEvent
  return key in LINES ? key : null
}

/**
 * Where Nila perches on each route, as a fraction of the viewport. She only
 * travels when the route does, so every page has one spot she belongs to and
 * the trip between them is the whole animation.
 */
const PERCH: Record<string, { x: number; y: number }> = {
  '/': { x: 0.88, y: 0.76 },
  '/about': { x: 0.12, y: 0.7 },
  '/software': { x: 0.9, y: 0.34 },
  '/hardware': { x: 0.1, y: 0.34 },
  '/contact': { x: 0.86, y: 0.62 },
  '/get-started': { x: 0.86, y: 0.62 },
}

/**
 * How close to each edge she is allowed to sit. On a phone the side rails
 * narrow with the screen, and the floor lifts clear of the bottom tab bar —
 * she used to park behind it.
 */
export function rails(viewport: { w: number; h: number }) {
  const side = Math.min(78, viewport.w * 0.16)
  return { side, floor: viewport.w < 860 ? 96 : side }
}

export function perch(pathname: string, viewport: { w: number; h: number }) {
  const spot = PERCH[pathname] ?? PERCH['/']
  const { side, floor } = rails(viewport)
  return {
    x: clamp(spot.x * viewport.w, side, viewport.w - side),
    y: clamp(spot.y * viewport.h, side, viewport.h - floor),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

/* --- explaining what is actually on screen -------------------------------- */

/** Trims a card's body copy down to the sentences worth reading aloud. */
export function firstSentence(text: string, max = 120, sentences = 1): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  let cut = 0
  for (let i = 0; i < sentences; i++) {
    const end = clean.slice(cut).search(/[.!?](\s|$)/)
    if (end < 0) { cut = clean.length; break }
    const next = cut + end + 1
    // One sentence is the floor; further ones only if they still fit.
    if (i > 0 && next > max) break
    cut = next
  }
  const said = clean.slice(0, cut || clean.length)
  if (said.length <= max) return said
  const space = said.lastIndexOf(' ', max)
  return said.slice(0, space > 40 ? space : max).trim() + '…'
}

/* What she can reach for when a card names a thing but never says what it
   looks like in practice. Keyed loosely, because these titles are marketing
   copy and the same idea shows up under four different headings. */
const EXAMPLES: { match: RegExp; example: string }[] = [
  { match: /\bai\b|intelligen|\bmodels?\b|\bllm|\bagents?\b/i, example: 'think a support agent that reads your own docs, or a model that flags the odd invoice before a human ever sees it' },
  { match: /hardware|robot|\bdevices?\b|embedded|sensor|circuit|\bpcb\b|firmware/i, example: 'think a sensor board that survives a factory floor, or a machine that tells you it is about to fail a week early' },
  { match: /automat|workflow|integrat|pipeline/i, example: 'think the spreadsheet nobody wants to update, updating itself overnight' },
  { match: /\bdata\b|analytic|insight|dashboard/i, example: 'think one number on a screen that used to take three people a morning to agree on' },
  { match: /\bweb\b|website|frontend|\bapps?\b|mobile/i, example: 'think a site that still loads on a bad train connection, and an app that behaves the same on a five-year-old phone' },
  { match: /software|platform|\bsaas\b|\bsystems?\b/i, example: 'think an internal dashboard your ops team actually lives in, or a booking flow a customer never has to think about' },
  { match: /design|\bux\b|\bui\b|brand|experience/i, example: 'think the difference between a form people finish and one they abandon halfway' },
  { match: /consult|strategy|discovery|advis/i, example: 'think two weeks of asking awkward questions before anyone writes a line of code' },
  { match: /support|maintain|scal|\bops\b|cloud|deploy/i, example: 'think the 3am page that never happens, because someone thought about it in advance' },
  { match: /\bteam\b|\babout\b|who we|people|career|hiring|join/i, example: 'eight of us, and everyone here has shipped something that had to work on a Monday morning' },
  { match: /contact|\btalk\b|get started|\bquote\b/i, example: 'tell us the messy version, the half-formed ideas are the ones we like' },
]

/** The example that fits a card, from its title and its own copy. */
export function exampleFor(title: string, body = ''): string | null {
  const hay = `${title} ${body}`
  return EXAMPLES.find((e) => e.match.test(hay))?.example ?? null
}

const OPENERS = ['This one is', "Here's", 'This bit is']

/**
 * What she says about a box she has flown over to. Built from the card's own
 * copy — up to two sentences, then whatever the card itself lists as proof,
 * and failing that a concrete example, because "AI Solutions" on its own tells
 * you nothing you did not already know from reading the heading.
 */
export function explainLine(title: string, body?: string, points: string[] = []): string | null {
  const name = title.replace(/\s+/g, ' ').trim()
  if (!name) return null
  const said = body ? firstSentence(body, 170, 2) : ''
  const listed = points.map((p) => firstSentence(p, 42)).filter(Boolean).slice(0, 3)
  const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)]
  const lead = said ? `${name} — ${said}` : `${opener} ${name}.`
  // A card that lists its own specifics beats anything canned.
  if (listed.length >= 2) return `${lead} For example: ${listed.join(', ')}.`
  const example = exampleFor(name, body)
  return example ? `${lead} ${capitalise(example)}.` : lead
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Where she stands to explain a box: out on the side rail, level with the
 * box's middle. She keeps to one of two vertical lanes rather than parking at
 * an arbitrary offset, so she reads as something living down the edge of the
 * page — and never covers the thing she is talking about.
 */
export function besideBox(
  rect: { left: number; right: number; top: number; bottom: number },
  viewport: { w: number; h: number },
): { x: number; y: number } {
  const { side, floor } = rails(viewport)
  const roomRight = viewport.w - rect.right
  const right = roomRight >= rect.left
  return {
    x: right ? viewport.w - side : side,
    y: clamp((rect.top + rect.bottom) / 2, side, viewport.h - floor),
  }
}
