import { useEffect, useRef } from 'react'
import NilaScene from './NilaScene'
import type { NilaLook } from './NilaModel'
import './Nila.css'

/**
 * Nila in the home hero: all of her, planted bottom-centre of the section,
 * waving. She is deliberately static otherwise — no float, no sway, no idle
 * drift — so the only motion in the hero is the wave and the blink. She stays
 * exactly there for as long as the hero is on the page; nothing here shrinks,
 * fades or carries her off on scroll. Her eyes still track the pointer.
 */
export default function NilaHero() {
  const box = useRef<HTMLDivElement>(null)
  const look = useRef<NilaLook>({ x: 0, y: 0, active: false })

  useEffect(() => {
    const node = box.current
    const hero = node?.closest<HTMLElement>('.home-hero')
    if (!node || !hero) return

    const onPointerMove = (event: PointerEvent) => {
      const r = hero.getBoundingClientRect()
      if (!r.width || !r.height) return
      look.current.x = Math.max(-1, Math.min(1, ((event.clientX - r.left) / r.width) * 2 - 1))
      // Screen y grows downward; her eyes do not.
      look.current.y = Math.max(-1, Math.min(1, -(((event.clientY - r.top) / r.height) * 2 - 1)))
      look.current.active = true
    }
    // Back to her own idle drift once you leave, rather than staring at the
    // last place the pointer was.
    const onPointerLeave = () => { look.current.active = false }

    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onPointerLeave)
    return () => {
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <div className="nila-hero" ref={box} aria-hidden="true">
      <NilaScene fit="hero" mood="happy" still waving lookRef={look} className="nila-scene--hero" />
    </div>
  )
}
