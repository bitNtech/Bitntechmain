import { Link } from 'react-router-dom'
import NilaScene from './NilaScene'
import { useMediaQuery, useNilaTalk } from './useNilaTalk'
import './Nila.css'

/**
 * The full-size Nila in the home hero. She introduces herself, makes small
 * talk, and every few beats points at Get Started — which is a real link here,
 * so the pitch is clickable rather than decorative.
 */
export default function NilaHero({ active = true }: { active?: boolean }) {
  // One Nila per phone. The floating companion is the one you can talk to and
  // carry around, so on a small screen the hero copy of her stands down rather
  // than paying for a second WebGL context nobody can interact with.
  const phone = useMediaQuery('(max-width: 720px)')
  const { text, mood, nudging } = useNilaTalk(active && !phone, 'greet')
  if (phone) return null

  return (
    <div className="nila-hero">
      <div className={`nila-bubble${text ? ' is-on' : ''}${nudging ? ' is-nudge' : ''}`} role="status" aria-live="polite">
        <span>{text}</span>
        {nudging && (
          <Link className="nila-bubble__cta" to="/get-started">Get Started →</Link>
        )}
      </div>
      <NilaScene mood={mood} waving={nudging} className="nila-scene--hero" />
    </div>
  )
}
