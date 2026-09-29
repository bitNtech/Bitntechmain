export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Whether this browser can draw the scenes at all.
 *
 * three.js has been WebGL2-only since r163, so a context is the whole question:
 * without one the canvas would mount and stay blank. This is the only reason a
 * visitor should ever be denied the model — everything else below is about
 * what it costs to fetch, not whether it can be shown.
 */
let webgl: boolean | undefined
export function canRenderWebGL(): boolean {
  if (typeof document === 'undefined') return false
  if (webgl !== undefined) return webgl
  try {
    const gl = document.createElement('canvas').getContext('webgl2') as WebGL2RenderingContext | null
    /* Hand the probe context straight back. Browsers cap live contexts (about
       16 in Chrome, fewer on phones) and drop the oldest past it, so a probe
       per route change could cost a real scene its context. */
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    webgl = !!gl
  } catch {
    /* Some privacy modes throw rather than returning null. */
    webgl = false
  }
  return webgl
}

export function prefersLessMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Whether this visit should be shown the decorative WebGL scenes.
 *
 * The bar used to be far higher than it should have been, and the models were
 * missing on a lot of ordinary machines because of it:
 *
 *  - `deviceMemory <= 4` — Chrome quantises this to 0.25/0.5/1/2/4/8 and caps
 *    it at 8, so "4" is not a weak device, it is most laptops and most phones.
 *    That one line was hiding the robot arm and the workspace on roughly half
 *    the devices that asked for them.
 *  - `effectiveType === '3g'` — measured, not the radio, and a good 4G
 *    connection under load reports 3g routinely.
 *  - `prefers-reduced-motion` — a reason not to *animate* the model, not a
 *    reason to withhold it. It is rendered still instead; see `prefersLessMotion`.
 *
 * What is left is the two signals that actually mean "do not spend megabytes
 * here": the visitor has asked their browser to save data, or the connection is
 * genuinely 2G.
 */
export function canAffordHeavyMedia(): boolean {
  if (typeof window === 'undefined') return false
  if (!canRenderWebGL()) return false

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if (nav.connection?.effectiveType && /^(slow-)?2g$/.test(nav.connection.effectiveType)) return false
  /* Genuinely tiny devices only — see the note above about what 4 means. */
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 0.5) return false
  return true
}
