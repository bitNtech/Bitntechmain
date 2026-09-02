import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_MS, idleEvent, pickLine, type NilaEvent, type NilaMood } from './nilaBrain'

type Talk = {
  text: string | null
  mood: NilaMood
  /** True while she is pitching the Get Started button. */
  nudging: boolean
  say: (event: NilaEvent) => void
  /** Speak a line built at runtime — what she reads off the page, or a reply. */
  sayText: (text: string, mood?: NilaMood, ms?: number) => void
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
  const lastText = useRef<string>(undefined)
  const idleCount = useRef(0)
  const hideTimer = useRef<number>(undefined)

  const speak = useCallback((text: string, mood: NilaMood, ms: number, nudge: boolean) => {
    lastText.current = text
    setText(text)
    setMood(mood)
    setNudging(nudge)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      setText(null)
      setMood('idle')
      setNudging(false)
    }, ms)
  }, [])

  const say = useCallback((event: NilaEvent) => {
    const line = pickLine(event, lastText.current)
    speak(line.text, line.mood, line.ms ?? DEFAULT_MS, event === 'nudge' || event === 'cta-near')
  }, [speak])

  // Longer lines need longer on screen, or she cuts herself off mid-sentence.
  const sayText = useCallback((text: string, mood: NilaMood = 'happy', ms?: number) => {
    speak(text, mood, ms ?? Math.min(4200 + text.length * 55, 14000), false)
  }, [speak])

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

  return { text, mood, nudging, say, sayText }
}
