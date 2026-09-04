export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Whether this visit should be shown the decorative WebGL scenes.
 *
 * They are worth several megabytes of geometry and a continuous GPU loop for
 * something that is `aria-hidden` and, on phones, sits at 62% opacity behind
 * the type. That is a fair trade on a laptop on wifi and a bad one on a metered
 * phone, so the trade is made per visit rather than once at build time. When it
 * says no, the hero keeps its CSS ornament and nothing else changes.
 */
export function canAffordHeavyMedia(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if (nav.connection?.effectiveType && /^(slow-)?2g$|^3g$/.test(nav.connection.effectiveType)) return false
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return false
  /* No WebGL, no point downloading a model for it. */
  return !!document.createElement('canvas').getContext('webgl2')
}
