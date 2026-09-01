import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_MS, idleEvent, pickLine, type NilaEvent, type NilaMood } from './nilaBrain'

type Talk = {
  text: string | null
  mood: NilaMood
  /** True while she is pitching the Get Started button. */
  nudging: boolean
  say: (event: NilaEvent) => void
}

/**
 * Drives one Nila's speech: an opening line, then small talk on a loop with a
 * Get Started pitch every few beats. `active` false parks her silently, which
 * is how the page keeps only one Nila talking at a time.
 */
export function useNilaTalk(active: boolean, firstEvent: NilaEvent = 'greet', beat = 11000): Talk {
  const [text, setText] = useState<string | null>(null)
  const [mood, setMood] = useState<NilaMood>('idle')
  const [nudging, setNudging] = useState(false)
  const lastText = useRef<string>()
  const idleCount = useRef(0)
  const hideTimer = useRef<number>()

  const say = useCallback((event: NilaEvent) => {
    const line = pickLine(event, lastText.current)
    lastText.current = line.text
    setText(line.text)
    setMood(line.mood)
    setNudging(event === 'nudge' || event === 'cta-near')
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      setText(null)
      setMood('idle')
      setNudging(false)
    }, line.ms ?? DEFAULT_MS)
  }, [])

  useEffect(() => {
    if (!active) {
      window.clearTimeout(hideTimer.current)
      setText(null)
      setNudging(false)
      return
    }
    const hello = window.setTimeout(() => say(firstEvent), 900)
    const loop = window.setInterval(() => {
      idleCount.current += 1
      say(idleEvent(idleCount.current))
    }, beat)
    return () => {
      window.clearTimeout(hello)
      window.clearInterval(loop)
    }
  }, [active, firstEvent, beat, say])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  return { text, mood, nudging, say }
}

/** Pointer in -1..1 view space, shared by every Nila on the page. */
export function useViewportPointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return pointer
}
