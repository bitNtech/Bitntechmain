import { useEffect } from 'react'
import StickyCta from './StickyCta'
import Hero from './sections/Hero'
import Film from './sections/Film'
import Problem from './sections/Problem'
import Capabilities from './sections/Capabilities'
import Languages from './sections/Languages'
import Steps from './sections/Steps'
import UseCases from './sections/UseCases'
import Demo from './sections/Demo'
import EndCard from './sections/EndCard'
import './AicaPage.css'

/**
 * AICA's own page — "Explore AICA" on /products lands here. One goal: book a
 * demo. The order follows the film — the calls keep coming, nobody picks up,
 * meet AICA, what it does, the languages it speaks — and then how to get it.
 *
 * The site's Navbar and Footer frame it like every other route; everything
 * the page draws itself is scoped under `.aica-page` (see AicaPage.css).
 */
export default function AicaPage() {
  /* Section headings rise in as they arrive. Everything renders visible; only
     once this runs is anything below the fold held back. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const els = [...document.querySelectorAll<HTMLElement>('.aica-page .rise')].filter((el) => el.getBoundingClientRect().top > window.innerHeight)
    els.forEach((el) => el.classList.add('is-waiting'))
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.remove('is-waiting')
        io.unobserve(e.target)
      }
    }, { rootMargin: '0px 0px -10% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main id="main" className="aica-page">
      <Hero />
      <Film />
      <Problem />
      <Capabilities />
      <Languages />
      <Steps />
      <UseCases />
      <Demo />
      <EndCard />
      <StickyCta />
    </main>
  )
}
