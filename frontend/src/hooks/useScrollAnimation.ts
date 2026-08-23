import { useEffect } from 'react'

export function useScrollAnimation(selector: string) {
  useEffect(() => {
    const els = [...document.querySelectorAll(selector)]
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [selector])
}
