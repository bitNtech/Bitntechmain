import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { useInView } from './useInView'
import './Glyphs.css'

type GlyphProps = { className?: string; size?: number }

function Frame({ children, className, size = 56 }: GlyphProps & { children: ReactNode }) {
  const { ref, inView } = useInView<SVGSVGElement>()

  return (
    <svg
      ref={ref}
      data-inview={inView ? 'true' : 'false'}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      className={cn('vr-glyph', 'text-signal', className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** 01 — Artificial Intelligence: a neural lattice that pulses. */
export const GlyphNeural = (p: GlyphProps) => (
  <Frame {...p}>
    <g className="glyph-draw" opacity={0.9}>
      <path d="M10 18h14M10 32h14M10 46h14M40 25h14M40 39h14" />
      <path d="M24 18 40 25M24 32 40 25M24 32 40 39M24 46 40 39" />
    </g>
    <g className="text-signal">
      <circle cx="24" cy="18" r="2.5" className="glyph-blink" />
      <circle cx="24" cy="32" r="2.5" className="glyph-blink" style={{ animationDelay: '.4s' }} />
      <circle cx="24" cy="46" r="2.5" className="glyph-blink" style={{ animationDelay: '.8s' }} />
      <circle cx="40" cy="25" r="2.5" className="glyph-blink" style={{ animationDelay: '1.1s' }} />
      <circle cx="40" cy="39" r="2.5" className="glyph-blink" style={{ animationDelay: '1.4s' }} />
    </g>
  </Frame>
)

/** 02 — AI Agents: orbiting satellites around a core. */
export const GlyphAgent = (p: GlyphProps) => (
  <Frame {...p}>
    <circle cx="32" cy="32" r="7" />
    <g className="glyph-spin" style={{ transformOrigin: '32px 32px' }}>
      <ellipse cx="32" cy="32" rx="22" ry="10" opacity={0.55} />
      <circle cx="54" cy="32" r="2.5" fill="currentColor" />
    </g>
    <g className="glyph-spin-rev" style={{ transformOrigin: '32px 32px' }}>
      <ellipse cx="32" cy="32" rx="10" ry="22" opacity={0.55} />
      <circle cx="32" cy="10" r="2.5" fill="currentColor" />
    </g>
  </Frame>
)

/** 03 — Software Engineering: nested stack frames. */
export const GlyphStack = (p: GlyphProps) => (
  <Frame {...p}>
    <g className="glyph-lift">
      <path d="M32 8 56 20 32 32 8 20Z" />
      <path d="M8 32 32 44 56 32" opacity={0.7} />
      <path d="M8 44 32 56 56 44" opacity={0.4} />
    </g>
  </Frame>
)

/** 04 — Web & Mobile: viewport + device. */
export const GlyphSurface = (p: GlyphProps) => (
  <Frame {...p}>
    <rect x="6" y="12" width="38" height="28" />
    <path d="M6 20h38" opacity={0.6} />
    <rect x="40" y="30" width="18" height="26" />
    <path d="M40 38h18" opacity={0.6} />
    <rect x="10" y="24" width="10" height="2" className="glyph-slide" fill="currentColor" stroke="none" />
  </Frame>
)

/** 05 — Automation: interlocking gears. */
export const GlyphGear = (p: GlyphProps) => (
  <Frame {...p}>
    <g className="glyph-spin" style={{ transformOrigin: '24px 26px' }}>
      <circle cx="24" cy="26" r="12" />
      <circle cx="24" cy="26" r="4" />
      <path d="M24 10v6M24 36v6M8 26h6M34 26h6M13 15l4 4M31 33l4 4M35 15l-4 4M17 33l-4 4" />
    </g>
    <g className="glyph-spin-rev" style={{ transformOrigin: '44px 44px' }}>
      <circle cx="44" cy="44" r="8" />
      <circle cx="44" cy="44" r="2.5" />
      <path d="M44 34v4M44 50v4M34 44h4M50 44h4" />
    </g>
  </Frame>
)

/** 06 — Robotics: articulated arm. */
export const GlyphArm = (p: GlyphProps) => (
  <Frame {...p}>
    <path d="M8 56h20" />
    <rect x="12" y="46" width="12" height="10" />
    <g className="glyph-swing" style={{ transformOrigin: '18px 46px' }}>
      <path d="M18 46 30 24" />
      <circle cx="30" cy="24" r="3" />
      <path d="M30 24 48 18" />
      <path d="M48 12v12M44 14l4 4 4-4" />
    </g>
  </Frame>
)
