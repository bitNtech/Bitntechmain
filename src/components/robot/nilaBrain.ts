/* What Nila says and feels. Kept free of React and three so the scheduling
   rules can be checked without a browser — see nilaBrain.test.ts. */

export type NilaMood = 'idle' | 'happy' | 'excited' | 'watching' | 'thinking' | 'success'

export type NilaLine = { text: string; mood: NilaMood; ms?: number }

/** Everything that can make Nila speak. */
export type NilaEvent =
  | 'greet'
  | 'idle'
  | 'nudge'
  | 'deep-scroll'
  | 'cta-near'
  | 'form-focus'
  | 'form-sent'
  | 'route:/'
  | 'route:/about'
  | 'route:/contact'
  | 'route:/software'
  | 'route:/hardware'

const LINES: Record<NilaEvent, NilaLine[]> = {
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
 * Where the floating Nila should sit, in viewport pixels.
 *
 * She parks in her corner, but drifts partway toward the pointer when it is
 * close enough to feel like she noticed — that is the whole "follows you"
 * effect, and clamping keeps her on screen and out of the tab bar.
 */
export function roamTarget(
  home: { x: number; y: number },
  pointer: { x: number; y: number },
  viewport: { w: number; h: number },
  curious: boolean,
): { x: number; y: number } {
  if (!curious) return home
  const dx = pointer.x - home.x
  const dy = pointer.y - home.y
  const distance = Math.hypot(dx, dy)
  // Far away she stays put; the pull only kicks in inside a comfortable radius.
  const reach = Math.min(distance, 260)
  const pull = distance > 0 ? reach / distance : 0
  const margin = 78
  return {
    x: clamp(home.x + dx * pull * 0.55, margin, viewport.w - margin),
    y: clamp(home.y + dy * pull * 0.55, margin, viewport.h - margin),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}
