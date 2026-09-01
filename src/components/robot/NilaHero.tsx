import { Link } from 'react-router-dom'
import NilaScene from './NilaScene'
import { useNilaTalk, useViewportPointer } from './useNilaTalk'
import './Nila.css'

/**
 * The full-size Nila in the home hero. She introduces herself, makes small
 * talk, and every few beats points at Get Started — which is a real link here,
 * so the pitch is clickable rather than decorative.
 */
export default function NilaHero({ active = true }: { active?: boolean }) {
  const pointer = useViewportPointer()
  const { text, mood, nudging } = useNilaTalk(active, 'greet')

  return (
    <div className="nila-hero">
      <div className={`nila-bubble${text ? ' is-on' : ''}${nudging ? ' is-nudge' : ''}`} role="status" aria-live="polite">
        <span>{text}</span>
        {nudging && (
          <Link className="nila-bubble__cta" to="/get-started">Get Started →</Link>
        )}
      </div>
      <NilaScene pointerRef={pointer} mood={mood} waving={nudging} className="nila-scene--hero" />
    </div>
  )
}
