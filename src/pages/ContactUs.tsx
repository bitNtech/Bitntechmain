import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTACT } from '../contact'
import './ContactUs.css'

/**
 * The contact page, as a piece of the same machine the landing hero is.
 *
 * It shares that page's system — the near-black ground, the mono micro-labels,
 * the staggered blur-to-sharp build driven by one `--i` per element, the eased
 * pointer written to `--mx`/`--my` for every layer to read at its own rate —
 * without repeating its composition. The home board's traces and pads are
 * deliberately absent: the visual here is the reaching hands behind the panel,
 * and the page is led by the brief rather than by the headline.
 *
 * The form is React-controlled, which is what makes the signal panel cheap:
 * it is a render of the same state the fields write, not a second copy kept in
 * sync by hand. Field names, validation rules and the success flow are the
 * ones the previous page had.
 */

const PROJECT_TYPES = [
  'Website', 'Web app', 'Mobile app', 'AI / AICA', 'Hardware',
  'Embedded system', 'Automation', 'Software', 'Other',
] as const

/* Value carries the machine-readable key, label the rupee string. INR only —
   there is no dollar figure anywhere on this page by design. */
const BUDGETS = [
  { value: '25k-50k', label: '₹25K – ₹50K', scale: 'Pilot' },
  { value: '50k-1l', label: '₹50K – ₹1L', scale: 'Growth' },
  { value: '1l-2.5l', label: '₹1L – ₹2.5L', scale: 'Growth' },
  { value: '2.5l-5l', label: '₹2.5L – ₹5L', scale: 'Scale' },
  { value: '5l-plus', label: '₹5L+', scale: 'Platform' },
  { value: 'not-sure', label: 'Not sure yet', scale: 'To scope' },
] as const

const CHANNELS = [
  { key: 'phone', label: 'Phone', value: CONTACT.phone, href: CONTACT.phoneHref, external: false },
  { key: 'email', label: 'Email', value: CONTACT.email, href: CONTACT.emailHref, external: false },
  { key: 'instagram', label: 'Instagram', value: CONTACT.instagram.handle, href: CONTACT.instagram.url, external: true },
  { key: 'linkedin', label: 'LinkedIn', value: CONTACT.linkedin.handle, href: CONTACT.linkedin.url, external: true },
  { key: 'github', label: 'GitHub', value: CONTACT.github.handle, href: CONTACT.github.url, external: true },
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Field = 'name' | 'email' | 'phone' | 'company' | 'details'

export default function ContactUs() {
  const rootRef = useRef<HTMLElement>(null)
  const budgetRef = useRef<HTMLDivElement>(null)

  const [values, setValues] = useState<Record<Field, string>>({
    name: '', email: '', phone: '', company: '', details: '',
  })
  const [projectType, setProjectType] = useState('')
  const [budget, setBudget] = useState('')
  const [budgetOpen, setBudgetOpen] = useState(false)
  /* One message at a time, against the field it belongs to — the same
     one-complaint-at-a-time rule the page had before. */
  const [error, setError] = useState<{ field: string; message: string } | null>(null)
  const [sent, setSent] = useState(false)

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setError((err) => (err?.field === field ? null : err))
  }

  const budgetEntry = useMemo(() => BUDGETS.find((b) => b.value === budget), [budget])

  /* Written by the eased pointer loop and read by every layer at its own rate:
     the traces move furthest, the panel barely at all. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tmx = 0, tmy = 0, mx = 0, my = 0
    let raf = 0
    let running = false

    const tick = () => {
      mx += (tmx - mx) * 0.06
      my += (tmy - my) * 0.06
      root.style.setProperty('--mx', mx.toFixed(4))
      root.style.setProperty('--my', my.toFixed(4))
      // Parks itself once it has caught up; the next move wakes it again.
      if (Math.abs(tmx - mx) < 0.0004 && Math.abs(tmy - my) < 0.0004) {
        running = false
        raf = 0
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      if (!r.width || !r.height) return
      tmx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
      tmy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
      wake()
    }
    const onLeave = () => {
      tmx = 0
      tmy = 0
      wake()
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* Sections build as they arrive rather than all at once on load. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        io.unobserve(entry.target)
      }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    root.querySelectorAll('[data-build]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // The custom listbox closes on an outside click, like the page's old one.
  useEffect(() => {
    if (!budgetOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!budgetRef.current?.contains(e.target as Node)) setBudgetOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBudgetOpen(false)
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [budgetOpen])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sent) return

    // Same three rules as before, reported one at a time.
    if (!values.name.trim()) return fail('name', 'A name is needed before we can reply.')
    if (!EMAIL_RE.test(values.email.trim())) return fail('email', 'That address will not reach you.')
    if (!projectType) return fail('projectType', 'Pick the kind of project this is.')

    setError(null)
    setSent(true)
  }

  const fail = (field: string, message: string) => {
    setError({ field, message })
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-focus="${field}"]`)
    el?.focus()
  }

  const signal = [
    { label: 'Type', value: projectType },
    { label: 'Scale', value: budgetEntry?.scale ?? '' },
    { label: 'Budget', value: budgetEntry?.label ?? '' },
  ]
  const ready = Boolean(projectType && values.name.trim() && EMAIL_RE.test(values.email.trim()))

  return (
    <main className="cx" id="main" ref={rootRef}>
      {/* ---- the ground: the hero's scene, quieter ---- */}
      <div className="cx-scene" aria-hidden="true">
        {/* The reach. Inverted, because the plate is cut on white and this page
            is not — see ContactUs.css. It is the whole visual: this page does
            not repeat the home board, it answers it. */}
        <div className="cx-bg" />
        <div className="cx-spark" />
        <div className="cx-haze" />
        <div className="cx-vignette" />
      </div>

      {/* ---- hero ---- */}
      <header className="cx-hero">
        <p className="cx-label cx-build" style={{ '--i': 0 } as React.CSSProperties}>
          BitNTech <i>/</i> Project inquiry
        </p>
        <h1 className="cx-head">
          <span className="cx-line">
            <span className="cx-build" style={{ '--i': 1.4 } as React.CSSProperties}>Let&rsquo;s build</span>
          </span>
          <span className="cx-line cx-line--hero">
            <span className="cx-build" style={{ '--i': 2.6 } as React.CSSProperties}>What&rsquo;s next.</span>
          </span>
        </h1>
        <p className="cx-lead cx-build" style={{ '--i': 4.4 } as React.CSSProperties}>
          Have an idea, product, system or problem worth engineering? Tell us what
          you&rsquo;re building and let&rsquo;s figure out the next step.
        </p>
      </header>

      {/* ---- one interface, two halves ---- */}
      <section className="cx-panel" id="start" data-build>
        <div className="cx-panel__side cx-panel__side--form">
          <p className="cx-label">Start a project</p>

          <form className="cx-form" onSubmit={onSubmit} noValidate>
            <p className="cx-group"><b>01</b><span>Who you are</span></p>

            <div className={`cx-field${error?.field === 'name' ? ' has-error' : ''}`}>
              <label htmlFor="cx-name">Name</label>
              <input
                id="cx-name" name="name" type="text" autoComplete="name" required
                aria-invalid={error?.field === 'name' || undefined}
                aria-describedby="cx-note"
                data-focus="name" value={values.name} onChange={set('name')}
              />
              <i className="cx-field__signal" aria-hidden="true" />
            </div>

            <div className={`cx-field${error?.field === 'email' ? ' has-error' : ''}`}>
              <label htmlFor="cx-email">Email</label>
              <input
                id="cx-email" name="email" type="email" autoComplete="email" required
                aria-invalid={error?.field === 'email' || undefined}
                aria-describedby="cx-note"
                data-focus="email" value={values.email} onChange={set('email')}
              />
              <i className="cx-field__signal" aria-hidden="true" />
            </div>

            <div className="cx-field">
              <label htmlFor="cx-phone">Phone <em>optional</em></label>
              <input
                id="cx-phone" name="phone" type="tel" autoComplete="tel"
                value={values.phone} onChange={set('phone')}
              />
              <i className="cx-field__signal" aria-hidden="true" />
            </div>

            <div className="cx-field">
              <label htmlFor="cx-company">Company <em>optional</em></label>
              <input
                id="cx-company" name="company" type="text" autoComplete="organization"
                value={values.company} onChange={set('company')}
              />
              <i className="cx-field__signal" aria-hidden="true" />
            </div>

            <p className="cx-group"><b>02</b><span>What you&rsquo;re building</span></p>

            {/* Chips rather than a dropdown: nine options is a set to scan, not
                a list to open, and the choice stays visible while the rest of
                the brief is filled in. */}
            <div
              className={`cx-chips cx-span${error?.field === 'projectType' ? ' has-error' : ''}`}
              role="group"
              aria-labelledby="cx-type-label"
              aria-describedby="cx-note"
            >
              <span className="cx-field__legend" id="cx-type-label">Project type</span>
              <div className="cx-chips__row">
                {PROJECT_TYPES.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    className={`cx-chip${projectType === t ? ' is-on' : ''}`}
                    aria-pressed={projectType === t}
                    {...(i === 0 ? { 'data-focus': 'projectType' } : {})}
                    onClick={() => {
                      setProjectType(t)
                      setError((err) => (err?.field === 'projectType' ? null : err))
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input type="hidden" name="projectType" value={projectType} />
            </div>

            {/* A native <select> draws its popup with the OS, which ignores
                every style on this page — so the listbox is ours, as before. */}
            <div className={`cx-field cx-field--select${budgetOpen ? ' is-open' : ''}`} ref={budgetRef}>
              <span className="cx-field__legend">Budget <em>optional</em></span>
              <button
                type="button"
                className="cx-select"
                aria-haspopup="listbox"
                aria-expanded={budgetOpen}
                onClick={() => setBudgetOpen((o) => !o)}
              >
                <span className={budgetEntry ? '' : 'is-placeholder'}>
                  {budgetEntry?.label ?? 'Select a range'}
                </span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z" /></svg>
              </button>
              <ul className="cx-options" role="listbox" aria-label="Budget range">
                {BUDGETS.map((b) => (
                  <li key={b.value} role="option" aria-selected={budget === b.value}>
                    <button type="button" onClick={() => { setBudget(b.value); setBudgetOpen(false) }}>
                      {b.label}
                    </button>
                  </li>
                ))}
              </ul>
              <input type="hidden" name="budget" value={budget} />
            </div>

            {(projectType || budgetEntry) && (
              <aside className="cx-signal">
                <p className="cx-label">Project signal</p>
                <dl>
                  {signal.filter((s) => s.value).map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Status</dt>
                    <dd className={ready ? 'is-ready' : ''}>
                      {ready ? 'Ready to engineer' : 'Awaiting brief'}
                      <i aria-hidden="true" />
                    </dd>
                  </div>
                </dl>
              </aside>
            )}

            <div className="cx-field cx-field--area cx-span">
              <label htmlFor="cx-details">The idea</label>
              <textarea
                id="cx-details" name="details" rows={5}
                placeholder="What are you trying to build, solve, automate or improve?"
                value={values.details} onChange={set('details')}
              />
              <i className="cx-field__signal" aria-hidden="true" />
            </div>

            {/* One live region for the whole form: the complaint and the
                receipt land in the same place, so nothing is announced twice. */}
            <p className="cx-note cx-span" id="cx-note" role="status" aria-live="polite">
              {error ? <span className="cx-note__err">{error.message}</span> : null}
            </p>

            <button className={`cx-send cx-span${sent ? ' is-sent' : ''}`} type="submit" disabled={sent}>
              <span className="cx-send__wash" aria-hidden="true" />
              <span className="cx-send__label">
                {sent ? 'Project brief received ✓' : 'Send project brief'}
              </span>
              {!sent && <span className="cx-send__go" aria-hidden="true">↗</span>}
            </button>

            {sent && (
              <div className="cx-receipt cx-span" role="status">
                <p className="cx-receipt__head">Project brief received ✓</p>
                <p>Your signal has reached BitNTech. We&rsquo;ll get back to you soon.</p>
              </div>
            )}
          </form>
        </div>

        <div className="cx-panel__side cx-panel__side--info">
          <p className="cx-label">Get in touch</p>

          <ul className="cx-channels">
            {CHANNELS.map((c) => (
              <li key={c.key}>
                <a
                  className="cx-channel"
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span className="cx-channel__label">{c.label}</span>
                  <span className="cx-channel__value">{c.value}</span>
                  <span className="cx-channel__go" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>

          {/* The status block: a readout, not a badge. The line under it is
              live — a trace with a charge running it, the site's own way of
              saying a channel is open, and the only thing here that moves. */}
          <div className="cx-status">
            <p className="cx-label">BitNTech <i>/</i> Contact node</p>
            <span className="cx-wire" aria-hidden="true"><i /></span>
            <p className="cx-status__live"><i aria-hidden="true" />Available for new projects</p>
            <dl className="cx-status__row">
              <dt>Response time</dt>
              <dd>Usually within 24–48 hours</dd>
            </dl>
          </div>
        </div>

      </section>

      {/* ---- closing ---- */}
      <section className="cx-closing" data-build>
        <h2>
          <span className="cx-line"><span>Have an idea?</span></span>
          <span className="cx-line cx-line--hero"><span>Let&rsquo;s engineer it.</span></span>
        </h2>
        <p className="cx-closing__span">Hardware · AI · Software</p>
        {/* Already on the contact page, so this goes to the form rather than
            re-routing to the page you are standing on. */}
        <a className="cx-closing__go" href="#start">
          <span>Start a conversation</span>
          <i aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}
