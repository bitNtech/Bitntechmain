import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* Everything that arrives on scroll starts at `opacity: 0` and is revealed by
   an IntersectionObserver. Hiding it from the stylesheet alone means that if
   the observer never runs — script blocked, an error earlier in the bundle, a
   browser without IO — the page is permanently blank. Gating the hiding rules
   behind this class makes the visible state the default and the hidden state
   the thing JavaScript opts into. */
document.documentElement.classList.add('js')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
