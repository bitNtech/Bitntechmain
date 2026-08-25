import { useEffect, useRef, useState } from 'react'

const callbacks = new WeakMap<Element, (visible: boolean) => void>()
let observer: IntersectionObserver | null = null

function getObserver() {
  if (!observer && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) callbacks.get(e.target)?.(e.isIntersecting)
      },
      { rootMargin: '120px 0px' },
    )
  }
  return observer
}

export function observeVisibility(el: Element, cb: (visible: boolean) => void) {
  const io = getObserver()
  if (!io) {
    cb(true)
    return () => {}
  }
  callbacks.set(el, cb)
  io.observe(el)
  return () => {
    io.unobserve(el)
    callbacks.delete(el)
  }
}

export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeVisibility(el, setInView)
  }, [])

  return { ref, inView }
}
