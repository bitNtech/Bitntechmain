import { useEffect, useRef } from 'react'
import { CONTACT } from '../contact'
import './ContactUs.css'

type ReasonKey = 'hardware' | 'software'

const REASONS: Record<ReasonKey, { label: string; mood: string; lines: string[] }> = {
  hardware: {
    label: 'Hardware',
    mood: 'excited',
    lines: ['Hardware! Boards, sensors, things that move.', 'Something real and physical. Beep boop, my kind of build.'],
  },
  software: {
    label: 'Software',
    mood: 'excited',
    lines: ['Software! My favorite kind of building.', "A platform, an app — go on, I'm listening."],
  },
}

export default function ContactUs() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!

    const robot = $<HTMLDivElement>('#robot')
    const eyes = $<HTMLDivElement>('#eyes')
    const bubble = $<HTMLDivElement>('#bubble')
    const bubbleText = $<HTMLSpanElement>('#bubbleText')
    const form = $<HTMLFormElement>('#form')
    const nameI = $<HTMLInputElement>('#name')
    const emailI = $<HTMLInputElement>('#email')
    const detailsI = $<HTMLTextAreaElement>('#details')
    const btn = $<HTMLButtonElement>('#sendBtn')
    const btnLabel = $<HTMLSpanElement>('#btnLabel')
    const head3d = $<HTMLDivElement>('.head3d')
    const scene = $<HTMLDivElement>('.scene')

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    let done = false
    let lastSaid = ''
    const timers: number[] = []
    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timers.push(id)
      return id
    }

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

    function setMood(mood: string) {
      if (!done) robot.dataset.mood = mood
    }

    function say(text: string) {
      if (text === lastSaid) return
      lastSaid = text
      bubbleText.textContent = text
      bubble.classList.remove('pop')
      void bubble.offsetWidth
      bubble.classList.add('pop')
    }

    function look(x: number, y: number) {
      eyes.style.setProperty('--lx', `${x}px`)
      eyes.style.setProperty('--ly', `${y}px`)
    }

    function tilt(ry: number, rx: number) {
      head3d.style.setProperty('--ry', `${ry}deg`)
      head3d.style.setProperty('--rx', `${rx}deg`)
    }

    function followTyping(input: HTMLInputElement | HTMLTextAreaElement) {
      const ratio = Math.min(input.value.length / 22, 1)
      look(-6 + 12 * ratio, 5)
      tilt(-5 + 10 * ratio, -8)
    }

    const onNameFocus = () => {
      setMood('watching')
      say(pick(['A visitor. State your name.', "Typing detected. Go on, I'm watching.", 'Hii! Tell me who you are 🩵']))
      followTyping(nameI)
    }
    const onNameInput = () => {
      followTyping(nameI)
      const v = nameI.value.trim()
      if (v.length >= 2) say(pick([`${v}. Solid name. Filed forever.`, `Aww, hi ${v}! Cute name.`]))
      else if (v.length === 0) say("Deleted. I've already forgotten it. Mostly.")
    }
    nameI.addEventListener('focus', onNameFocus)
    nameI.addEventListener('input', onNameInput)

    const onEmailFocus = () => {
      setMood('watching')
      say("Email next. I don't do spam — I don't even have an inbox.")
      followTyping(emailI)
    }
    const onEmailInput = () => {
      followTyping(emailI)
      if (EMAIL_RE.test(emailI.value.trim())) {
        setMood('happy')
        say(pick(['Now that is a proper email. Respect.', 'Valid address detected. Quietly delighted.', 'Yay, a real email! *sparkle*']))
      } else {
        setMood('watching')
        if (emailI.value.includes('@')) say('Close. My sensors say: not yet.')
      }
    }
    emailI.addEventListener('focus', onEmailFocus)
    emailI.addEventListener('input', onEmailInput)

    /* Native <select> renders its popup with the OS, which ignores every style
       on this page. Both dropdowns are listboxes we draw ourselves instead. */
    function customSelect(
        wrapId: string,
        onPick: (value: string, label: string) => void,
        onFocus: () => void,
      ) {
      const wrap = $<HTMLDivElement>(`#${wrapId}`)
      const trigger = wrap.querySelector<HTMLButtonElement>('.reason-trigger')!
      const label = trigger.querySelector<HTMLSpanElement>('span')!
      const options = [...wrap.querySelectorAll<HTMLLIElement>('li')]
      const hidden = wrap.querySelector<HTMLInputElement>('input[type="hidden"]')
      let value = ''

      const close = () => {
        wrap.classList.remove('open')
        trigger.setAttribute('aria-expanded', 'false')
      }
      const onTriggerClick = () => {
        // Only one list open at a time, or they overlap each other.
        document.querySelectorAll('.contact-us .field--select.open').forEach((o) => {
          if (o !== wrap) {
            o.classList.remove('open')
            o.querySelector('.reason-trigger')?.setAttribute('aria-expanded', 'false')
          }
        })
        const open = wrap.classList.toggle('open')
        trigger.setAttribute('aria-expanded', String(open))
      }
      const onOptionClick = (li: HTMLLIElement) => {
        value = li.dataset.value!
        if (hidden) hidden.value = value
        label.textContent = li.textContent
        label.classList.remove('placeholder')
        options.forEach((o) => o.setAttribute('aria-selected', String(o === li)))
        close()
        trigger.focus()
        onPick(value, li.textContent ?? '')
      }
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          close()
          trigger.focus()
        }
      }
      const onDocClick = (e: MouseEvent) => {
        if (!wrap.contains(e.target as Node)) close()
      }
      const clickHandlers = options.map((li) => () => onOptionClick(li))

      trigger.addEventListener('click', onTriggerClick)
      trigger.addEventListener('focus', onFocus)
      options.forEach((li, i) => li.addEventListener('click', clickHandlers[i]))
      wrap.addEventListener('keydown', onKeydown)
      document.addEventListener('click', onDocClick)

      return {
        trigger,
        get value() {
          return value
        },
        destroy() {
          trigger.removeEventListener('click', onTriggerClick)
          trigger.removeEventListener('focus', onFocus)
          options.forEach((li, i) => li.removeEventListener('click', clickHandlers[i]))
          wrap.removeEventListener('keydown', onKeydown)
          document.removeEventListener('click', onDocClick)
        },
      }
    }

    const reason = customSelect(
      'reasonSelect',
      (key) => {
        const r = REASONS[key as ReasonKey]
        look(0, -4)
        tilt(0, -6)
        setMood(r.mood)
        say(pick(r.lines))
      },
      () => {
        setMood('watching')
        say('Hardware or software? Pick one. I promise not to judge. Much.')
      },
    )

    const budget = customSelect(
      'budgetSelect',
      () => {
        setMood('happy')
        say(pick(['Noted. Numbers help more than you think.', 'Budget logged. No judgement, promise.']))
      },
      () => {
        setMood('watching')
        say(pick(["Ballpark is fine. I'm not an accountant.", 'Optional, but it helps us scope it.']))
      },
    )

    const onDetailsFocus = () => {
      setMood('watching')
      say(pick(['Extra details. My favorite kind of gossip.', "Go on, I'm all ears. Well, antenna."]))
      followTyping(detailsI)
    }
    const onDetailsInput = () => {
      followTyping(detailsI)
      const len = detailsI.value.length
      if (len > 160) say("That's a lot of detail. I respect it.")
      else if (len > 0) setMood('happy')
    }
    detailsI.addEventListener('focus', onDetailsFocus)
    detailsI.addEventListener('input', onDetailsInput)

    function hype(on: boolean) {
      if (done) return
      if (on && robot.classList.contains('is-pressed')) return
      robot.classList.toggle('is-hyped', on)
      if (on) {
        setMood('excited')
        say(pick(['Ooh. Do it. Send it.', 'This is my favorite part.', 'Eeep, so exciting!']))
      } else {
        setMood('idle')
        say('The button misses you already.')
      }
    }
    const onBtnEnter = () => hype(true)
    const onBtnLeave = () => hype(false)
    const onBtnFocus = () => hype(true)
    const onBtnBlur = () => hype(false)
    btn.addEventListener('mouseenter', onBtnEnter)
    btn.addEventListener('mouseleave', onBtnLeave)
    btn.addEventListener('focus', onBtnFocus)
    btn.addEventListener('blur', onBtnBlur)

    let pressTimer: number | undefined
    const onPointerDown = () => {
      window.clearTimeout(pressTimer)
      robot.classList.add('is-pressed')
      robot.dataset.mood = 'pressed'
      say(pick(['Ahh. That’s the stuff.', 'Mmm. Satisfying.', 'Beep. Do that again.', 'Eep! *giggle*']))
    }
    const releasePress = () => {
      window.clearTimeout(pressTimer)
      pressTimer = schedule(() => {
        robot.classList.remove('is-pressed')
        if (robot.dataset.mood === 'pressed') {
          robot.dataset.mood = done ? 'success' : 'excited'
        }
      }, 340)
    }
    const onPointerLeave = () => {
      if (robot.classList.contains('is-pressed')) releasePress()
    }
    btn.addEventListener('pointerdown', onPointerDown)
    btn.addEventListener('pointerup', releasePress)
    btn.addEventListener('pointercancel', releasePress)
    btn.addEventListener('pointerleave', onPointerLeave)

    function confetti() {
      const colors = ['#ff6e42', '#2ec4b6', '#ffc53d', '#1c1917', '#fffdf8']
      const origin = btn.getBoundingClientRect()
      const hostRect = scene.getBoundingClientRect()
      const ox = origin.left - hostRect.left + origin.width / 2
      const oy = origin.top - hostRect.top

      for (let i = 0; i < 70; i++) {
        const bit = document.createElement('span')
        bit.className = 'confetti'
        bit.style.background = pick(colors)
        if (Math.random() > 0.5) bit.style.borderRadius = '50%'
        scene.appendChild(bit)

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
        const speed = 240 + Math.random() * 380
        const tx = Math.cos(angle) * speed
        const ty = Math.sin(angle) * speed

        bit
          .animate(
            [
              { transform: `translate(${ox}px, ${oy}px) rotate(0deg) scale(1)`, opacity: 1 },
              {
                transform: `translate(${ox + tx}px, ${oy + ty + 320}px) rotate(${540 * (Math.random() > 0.5 ? 1 : -1)}deg) scale(.6)`,
                opacity: 0,
              },
            ],
            { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.15,.6,.35,1)' },
          )
          .addEventListener('finish', () => bit.remove())
      }
    }

    function reset() {
      done = false
      robot.dataset.mood = 'idle'
      btn.classList.remove('is-success')
      btnLabel.textContent = 'START A CONVERSATION ↗'
      say('Again? I could do this all day. *happy beep*')
    }

    const onSubmit = (e: SubmitEvent) => {
      e.preventDefault()
      if (done) return

      const complaints: [string, HTMLElement][] = []
      if (!nameI.value.trim()) complaints.push(["Still don't know your name.", nameI])
      else if (!EMAIL_RE.test(emailI.value.trim())) complaints.push(["That email isn't a real place.", emailI])
      else if (!reason.value) complaints.push(["Pick a project type, I'm dying of suspense.", reason.trigger])

      if (complaints.length) {
        const [msg, field] = complaints[0]
        schedule(() => {
          say(msg)
          setMood('watching')
        }, 380)
        form.classList.remove('shake')
        void form.offsetWidth
        form.classList.add('shake')
        field.focus()
        return
      }

      done = true
      robot.classList.remove('is-hyped')

      const reasonLabel = REASONS[reason.value as ReasonKey].label

      schedule(() => {
        robot.dataset.mood = 'success'
        say(`Filed under ${reasonLabel}. On it, ${nameI.value.trim()}! 🩵`)
        btn.classList.add('is-success')
        btnLabel.textContent = 'SENT ✓'
        look(0, 0)
        tilt(0, 0)

        if (!reduceMotion) {
          robot.classList.add('is-spinning')
          schedule(() => robot.classList.remove('is-spinning'), 950)
          confetti()
        }
      }, 420)

      schedule(reset, 5600)
    }
    form.addEventListener('submit', onSubmit)

    const blinkLoop = () => {
      schedule(() => {
        if (robot.dataset.mood !== 'success') {
          eyes.classList.add('blink')
          schedule(() => eyes.classList.remove('blink'), 150)
        }
        blinkLoop()
      }, 2600 + Math.random() * 2600)
    }
    blinkLoop()

    let rafPending = false
    let rafId = 0
    const onMouseMove = (e: MouseEvent) => {
      const active = document.activeElement
      if (done || (active && ['INPUT', 'BUTTON', 'TEXTAREA'].includes(active.tagName))) return
      if (rafPending) return
      rafPending = true
      rafId = requestAnimationFrame(() => {
        rafPending = false
        const rect = robot.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 260))
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 260))
        look(dx * 7, dy * 6)
        tilt(dx * 12, -dy * 9)
      })
    }
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      nameI.removeEventListener('focus', onNameFocus)
      nameI.removeEventListener('input', onNameInput)
      emailI.removeEventListener('focus', onEmailFocus)
      emailI.removeEventListener('input', onEmailInput)
      reason.destroy()
      budget.destroy()
      detailsI.removeEventListener('focus', onDetailsFocus)
      detailsI.removeEventListener('input', onDetailsInput)
      btn.removeEventListener('mouseenter', onBtnEnter)
      btn.removeEventListener('mouseleave', onBtnLeave)
      btn.removeEventListener('focus', onBtnFocus)
      btn.removeEventListener('blur', onBtnBlur)
      btn.removeEventListener('pointerdown', onPointerDown)
      btn.removeEventListener('pointerup', releasePress)
      btn.removeEventListener('pointercancel', releasePress)
      btn.removeEventListener('pointerleave', onPointerLeave)
      form.removeEventListener('submit', onSubmit)
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  return (
    <main className="contact-us" ref={rootRef}>
      <div className="scene">
        <div className="left-pane">
          <div className="card info-card">
            <h2 className="info-title">Have an idea? Let's engineer it.</h2>
            <p className="info-sub">Tell us what you're building, and let's figure out the next step.</p>

            <p className="info-eyebrow">Get in touch</p>
            <div className="info-list">
              <a className="info-row" href={CONTACT.phoneHref}>
                <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.9.9.6 0 1 .5 1 1V21c0 .6-.5 1-1 1C10.8 22 2 13.2 2 2.7c0-.5.5-1 1-1h4.1c.6 0 1 .4 1 1 .1 1.4.4 2.7.9 3.9.1.4 0 .8-.2 1L6.6 10.8Z"/></svg>
                <span className="info-label">Phone</span>
                <span className="info-value">{CONTACT.phone}</span>
              </a>
              <a className="info-row" href={CONTACT.emailHref}>
                <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 7.3L4.4 7h15.2L12 12.3ZM4 9.2V17h16V9.2l-8 5.3-8-5.3Z"/></svg>
                <span className="info-label">Email</span>
                <span className="info-value">{CONTACT.email}</span>
              </a>
              <a className="info-row" href={CONTACT.instagram.url} target="_blank" rel="noreferrer">
                <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.46.66.25 1.22.6 1.77 1.15.5.5.85 1.02 1.15 1.77.24.64.41 1.37.46 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.46 2.43a4.9 4.9 0 0 1-1.15 1.77c-.5.5-1.02.85-1.77 1.15-.64.24-1.37.41-2.43.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.46a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.24-.64-.41-1.37-.46-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.46-2.43.25-.66.6-1.22 1.15-1.77.5-.5 1.02-.85 1.77-1.15.64-.24 1.37-.41 2.43-.46C8.94 2.01 9.28 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.4-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/></svg>
                <span className="info-label">Instagram</span>
                <span className="info-value">{CONTACT.instagram.handle}</span>
              </a>
              <a className="info-row" href={CONTACT.linkedin.url} target="_blank" rel="noreferrer">
                <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9.98h4V21H3V9.98Zm7 0h3.83v1.51h.05c.53-1 1.85-2.06 3.8-2.06 4.07 0 4.82 2.68 4.82 6.16V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.64 0-1.89 1.28-1.89 2.59V21h-4V9.98Z"/></svg>
                <span className="info-label">LinkedIn</span>
                <span className="info-value">{CONTACT.linkedin.handle}</span>
              </a>
              <a className="info-row" href={CONTACT.github.url} target="_blank" rel="noreferrer">
                <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
                <span className="info-label">GitHub</span>
                <span className="info-value">{CONTACT.github.handle}</span>
              </a>
            </div>
          </div>
        </div>
        {/* Was a second <main> nested inside the page's own; only one is valid,
            and screen readers pick one landmark arbitrarily when there are two. */}
        <section className="stage" id="stage">
          <div className="robot" id="robot" data-mood="idle">
            <div className="bubble" id="bubble" role="status" aria-live="polite">
              <span id="bubbleText">Hi. I'm Nila. Tell me why you're here! 🩵</span>
            </div>

            <div className="antenna" aria-hidden="true">
              <span className="antenna-rod"></span>
              <span className="antenna-tip"></span>
            </div>

            <div className="head3d" aria-hidden="true">
              <div className="head" id="head">
                <span className="ear ear--l"></span>
                <span className="ear ear--r"></span>

                <div className="face face--front">
                  <div className="visor">
                    <div className="eyes" id="eyes">
                      <span className="eye eye--l"></span>
                      <span className="eye eye--r"></span>
                    </div>
                    <span className="cheek cheek--l"></span>
                    <span className="cheek cheek--r"></span>
                    <span className="mouth"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form className="card" id="form" noValidate>
            <span className="hand hand--l" aria-hidden="true"></span>
            <span className="hand hand--r" aria-hidden="true"></span>

            <label className="field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3.9 0-8 2-8 5v1.5h16V19c0-3-4.1-5-8-5Z"/></svg>
              <input id="name" name="name" type="text" placeholder="Your name" autoComplete="name" aria-label="Your name" />
            </label>

            <label className="field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 7.3L4.4 7h15.2L12 12.3ZM4 9.2V17h16V9.2l-8 5.3-8-5.3Z"/></svg>
              <input id="email" name="email" type="email" placeholder="Your email" autoComplete="email" aria-label="Your email" />
            </label>

            <label className="field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.9.9.6 0 1 .5 1 1V21c0 .6-.5 1-1 1C10.8 22 2 13.2 2 2.7c0-.5.5-1 1-1h4.1c.6 0 1 .4 1 1 .1 1.4.4 2.7.9 3.9.1.4 0 .8-.2 1L6.6 10.8Z"/></svg>
              <input id="phone" name="phone" type="tel" placeholder="Your phone (optional)" autoComplete="tel" aria-label="Your phone" />
            </label>

            <label className="field">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13h-6v-7H10v7H4Z"/></svg>
              <input id="company" name="company" type="text" placeholder="Company / organization (optional)" autoComplete="organization" aria-label="Company or organization" />
            </label>

            <div className="field field--select" id="reasonSelect">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>
              <button
                type="button"
                className="reason-trigger"
                id="reasonTrigger"
                aria-haspopup="listbox"
                aria-expanded="false"
              >
                <span id="reasonTriggerLabel" className="placeholder">Project type</span>
                <svg className="reason-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
              </button>
              {/* The listbox is drawn by hand, so the chosen value rides along in a
                  hidden input rather than in a <select>. */}
              <input type="hidden" name="projectType" id="reasonValue" />
              <ul className="reason-list" id="reasonList" role="listbox" aria-label="Project type">
                <li role="option" aria-selected="false" data-value="hardware">Hardware</li>
                <li role="option" aria-selected="false" data-value="software">Software</li>
              </ul>
            </div>

            <div className="field field--select" id="budgetSelect">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Z"/><text x="12" y="16.6" textAnchor="middle" fontSize="11" fontWeight="700">₹</text></svg>
              <button
                type="button"
                className="reason-trigger"
                id="budgetTrigger"
                aria-haspopup="listbox"
                aria-expanded="false"
              >
                <span className="placeholder">Budget range (optional)</span>
                <svg className="reason-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
              </button>
              <input type="hidden" name="budget" id="budgetValue" />
              <ul className="reason-list" role="listbox" aria-label="Budget range">
                <li role="option" aria-selected="false" data-value="25k-50k">₹25,000 – ₹50,000</li>
                <li role="option" aria-selected="false" data-value="50k-1l">₹50,000 – ₹1,00,000</li>
                <li role="option" aria-selected="false" data-value="1l-2.5l">₹1,00,000 – ₹2,50,000</li>
                <li role="option" aria-selected="false" data-value="2.5l-5l">₹2,50,000 – ₹5,00,000</li>
                <li role="option" aria-selected="false" data-value="5l-plus">₹5,00,000+</li>
                <li role="option" aria-selected="false" data-value="not-sure">Not sure yet</li>
              </ul>
            </div>

            <label className="field field--textarea">
              <svg className="field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4.5 4.2A1 1 0 0 1 3 20.4V5a1 1 0 0 1 1-1Zm2 4v2h12V8H6Zm0 4v2h8v-2H6Z"/></svg>
              <textarea id="details" name="details" placeholder="Anything else? (optional)" aria-label="Extra details" rows={3}></textarea>
            </label>

            <button className="btn" id="sendBtn" type="submit">
              <span className="btn-bolt" aria-hidden="true">⚡</span>
              <span className="btn-label" id="btnLabel">START A CONVERSATION ↗</span>
            </button>

            <span className="foot foot--l" aria-hidden="true"></span>
            <span className="foot foot--r" aria-hidden="true"></span>
          </form>
        </section>
      </div>
    </main>
  )
}
