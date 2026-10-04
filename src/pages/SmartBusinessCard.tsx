import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CONTACT, WA_MESSAGES, mailtoHref, whatsappHref } from '../contact'
import { CUSTOMIZATIONS, EMPTY, enquiryText, validate, type Field, type Values } from './cardEnquiry'
import { CARD_FAQ } from '../seo'
import { ProductVisual } from './Products'
import './Products.css'

/**
 * Smart Business Card product page and its customization enquiry.
 *
 * There is no backend on this site, so the form does not submit anywhere. It
 * validates, then builds the enquiry into a WhatsApp message or an email draft
 * that the visitor reviews and sends themselves — and it says so, instead of
 * claiming the message was delivered.
 * ponytail: client-side handoff only; add a server endpoint (secrets kept
 * server-side) if enquiries must arrive without the visitor pressing Send.
 */

const BENEFITS = [
  { title: 'One tap, not a typed number', body: 'A compatible phone can open your profile from the card, so your details arrive correctly the first time.' },
  { title: 'Your brand, not a template', body: 'Each card is designed to your identity — logo, colours and layout — rather than picked from a fixed range.' },
  { title: 'More than fits on a card', body: 'Your digital profile can carry links, social accounts and details that would never fit on printed card stock.' },
  { title: 'Built for teams', body: 'Consistent cards across a whole organisation, each linked to the right person.' },
]

const OPTIONS = [
  { title: 'Card design', body: 'Layout, colours and finish built around your brand. Material and finish options are confirmed with your quotation.' },
  { title: 'Logo & identity', body: 'Company logo, name, title and professional identity on the card face.' },
  { title: 'Digital profile', body: 'A personalized profile page the card opens — contact numbers, email and website.' },
  { title: 'Social & links', body: 'LinkedIn, Instagram, portfolio or any links you choose, shown on your profile.' },
]

const USE_CASES = [
  { title: 'Professionals', body: 'Consultants, doctors, lawyers and creatives who meet people every day and want to be remembered correctly.' },
  { title: 'Entrepreneurs', body: 'Founders who want a first impression that matches the product they are building.' },
  { title: 'Organisations', body: 'Sales, leadership and front-office teams with consistent branding across every card.' },
]

const STEPS = [
  { n: '01', title: 'Tap', body: 'The card is held near the back of an NFC-capable phone with NFC switched on.' },
  { n: '02', title: 'Open', body: 'The phone reads the link stored on the card and offers to open it.' },
  { n: '03', title: 'Connect', body: 'Your digital profile opens, with options to save your contact or follow your links.' },
]

export default function SmartBusinessCard() {
  const [v, setV] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  /* What happened after a valid submit — a handoff, never a delivery receipt. */
  const [handoff, setHandoff] = useState<{ channel: 'whatsapp' | 'email'; href: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { hash } = useLocation()

  /* Links from the catalogue arrive with #enquire; the router does not scroll to it. */
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setV((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setHandoff(null)
  }

  const send = (channel: 'whatsapp' | 'email') => {
    const found = validate(v)
    setErrors(found)
    const first = (Object.keys(found) as Field[])[0]
    if (first) {
      setHandoff(null)
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    const text = enquiryText(v)
    const href = channel === 'whatsapp'
      ? whatsappHref(text)
      : mailtoHref(`Smart Business Card enquiry — ${v.name.trim()}`, text)
    if (channel === 'whatsapp') window.open(href, '_blank', 'noopener,noreferrer')
    else window.location.href = href
    setHandoff({ channel, href })
  }

  const err = (field: Field) => errors[field]
  const describe = (field: Field) => (errors[field] ? `sbc-${field}-err` : undefined)
  const fieldProps = (field: Exclude<Field, 'consent'>) => ({
    id: `sbc-${field}`,
    name: field,
    value: v[field],
    onChange: set(field),
    'aria-invalid': err(field) ? true : undefined,
    'aria-describedby': describe(field),
  })
  const errText = (field: Field) =>
    err(field) ? <p className="sbc-err" id={`sbc-${field}-err`}>{err(field)}</p> : null

  return (
    /* Ground on the inner div — see Products.tsx. */
    <main id="main"><div className="pd sbc">
      <header className="sbc-hero">
        <div className="sbc-hero__copy">
          <nav aria-label="Breadcrumb" className="sbc-crumbs">
            <Link to="/products">Products</Link> <span aria-hidden="true">/</span> <span aria-current="page">Smart Business Card</span>
          </nav>
          <p className="pd-label">NFC-Enabled Digital Business Identity</p>
          <h1 className="pd-title sbc-title">Make every introduction count.</h1>
          <p className="pd-lead">
            A personalized NFC smart business card from BitNTech. We customize each
            card to reflect your brand, professional identity and networking needs,
            connecting the physical card to a digital profile.
          </p>
          <div className="pd-card__ctas">
            <a className="pd-btn pd-btn--primary" href="#enquire">Customize Your Card</a>
            <a className="pd-btn pd-btn--secondary" href={whatsappHref(WA_MESSAGES.smartCard)} target="_blank" rel="noopener noreferrer">
              Enquire on WhatsApp<span aria-hidden="true"> ↗</span><span className="pd-sr"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <figure className="sbc-hero__visual">
          <ProductVisual product={{ visual: 'card', shortName: 'Smart Business Card' }} />
          <figcaption>Illustration. Your card is designed to your brief.</figcaption>
        </figure>
      </header>

      <section className="sbc-section">
        <p className="pd-label">The product</p>
        <h2>A business card that opens a profile.</h2>
        <p className="sbc-prose">
          A Smart Business Card looks and feels like a premium printed card, with a
          small NFC chip inside. The chip stores a link to your digital profile. This
          is a customized solution, not an off-the-shelf product: the card design,
          the profile and what a tap opens are set up for you.
        </p>
      </section>

      <section className="sbc-section">
        <p className="pd-label">How NFC works</p>
        <h2>Tap, open, connect.</h2>
        <ol className="sbc-steps">
          {STEPS.map((s) => (
            <li key={s.n}><b>{s.n}</b><h3>{s.title}</h3><p>{s.body}</p></li>
          ))}
        </ol>
        <p className="sbc-note">
          What happens on a tap depends on how the card is configured and on the
          phone: NFC support, settings and behaviour vary by model and operating
          system. No NFC card works with every phone, so a printed QR code can be
          added as a fallback.
        </p>
      </section>

      <section className="sbc-section">
        <p className="pd-label">Why customized</p>
        <h2>Benefits</h2>
        <ul className="sbc-tiles">
          {BENEFITS.map((b) => <li key={b.title}><h3>{b.title}</h3><p>{b.body}</p></li>)}
        </ul>
      </section>

      <section className="sbc-section">
        <p className="pd-label">Customization</p>
        <h2>What we tailor</h2>
        <ul className="sbc-tiles">
          {OPTIONS.map((o) => <li key={o.title}><h3>{o.title}</h3><p>{o.body}</p></li>)}
        </ul>
        {/* Three colourways, drawn. Not photographs of manufactured cards. */}
        <div className="sbc-showcase" role="img" aria-label="Illustrated colourway examples: matte black, metallic and brand colour">
          <span className="sbc-swatch sbc-swatch--black">Matte black</span>
          <span className="sbc-swatch sbc-swatch--metal">Metallic</span>
          <span className="sbc-swatch sbc-swatch--brand">Your brand colour</span>
        </div>
        <p className="sbc-note">Illustrative examples. Available materials and finishes are confirmed with each quotation.</p>
      </section>

      <section className="sbc-section">
        <p className="pd-label">Who it is for</p>
        <h2>Use cases</h2>
        <ul className="sbc-tiles sbc-tiles--3">
          {USE_CASES.map((u) => <li key={u.title}><h3>{u.title}</h3><p>{u.body}</p></li>)}
        </ul>
      </section>

      <section className="sbc-section sbc-enquire" id="enquire" aria-labelledby="sbc-enquire-h">
        <div>
          <p className="pd-label">Customization enquiry</p>
          <h2 id="sbc-enquire-h">Tell us about your card.</h2>
          <p className="sbc-prose">
            Fill this in and continue on WhatsApp or by email. We reply with design
            options and a quotation. There is no online payment.
          </p>
          <ul className="sbc-direct">
            <li>
              <a href={whatsappHref(WA_MESSAGES.smartCard)} target="_blank" rel="noopener noreferrer">
                WhatsApp <b>{CONTACT.phone}</b><span className="pd-sr"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={mailtoHref('Smart Business Card enquiry', WA_MESSAGES.smartCard)}>Email <b>{CONTACT.email}</b></a>
            </li>
          </ul>
        </div>

        <form
          ref={formRef}
          className="sbc-form"
          noValidate
          onSubmit={(e) => { e.preventDefault(); send('whatsapp') }}
        >
          <div className="sbc-field">
            <label htmlFor="sbc-name">Full name</label>
            <input {...fieldProps('name')} type="text" autoComplete="name" maxLength={100} required />
            {errText('name')}
          </div>
          <div className="sbc-field">
            <label htmlFor="sbc-company">Company or organization <em>optional</em></label>
            <input {...fieldProps('company')} type="text" autoComplete="organization" maxLength={120} />
          </div>
          <div className="sbc-field">
            <label htmlFor="sbc-email">Email address</label>
            <input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} required />
            {errText('email')}
          </div>
          <div className="sbc-field">
            <label htmlFor="sbc-phone">WhatsApp / phone number</label>
            <input {...fieldProps('phone')} type="tel" autoComplete="tel" maxLength={20} placeholder="+91 …" required />
            {errText('phone')}
          </div>
          <div className="sbc-field">
            <label htmlFor="sbc-quantity">Required quantity</label>
            <input {...fieldProps('quantity')} type="number" inputMode="numeric" min={1} max={10000} step={1} required />
            {errText('quantity')}
          </div>
          <fieldset
            className="sbc-field sbc-choice"
            aria-invalid={err('customization') ? true : undefined}
            aria-describedby={describe('customization')}
          >
            <legend>Preferred customization</legend>
            <div className="sbc-choice__row">
              {CUSTOMIZATIONS.map((c) => (
                <label key={c}>
                  <input type="radio" name="customization" value={c} checked={v.customization === c} onChange={set('customization')} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            {errText('customization')}
          </fieldset>
          <div className="sbc-field sbc-span">
            <label htmlFor="sbc-branding">Branding and design requirements <em>optional</em></label>
            <textarea {...fieldProps('branding')} rows={3} maxLength={1000} placeholder="Logo, colours, finish, details to show…" />
          </div>
          <div className="sbc-field sbc-span">
            <label htmlFor="sbc-message">Additional message <em>optional</em></label>
            <textarea {...fieldProps('message')} rows={3} maxLength={1000} />
          </div>

          <div className="sbc-span">
            <label className="sbc-consent">
              <input
                type="checkbox" name="consent" checked={v.consent} onChange={set('consent')}
                aria-invalid={err('consent') ? true : undefined} aria-describedby={describe('consent') ?? 'sbc-privacy'}
              />
              <span>I agree that BitNTech may contact me about this enquiry using the details above.</span>
            </label>
            {errText('consent')}
            <p className="sbc-privacy" id="sbc-privacy">
              This page does not store or send your details. They are placed into a
              WhatsApp message or email draft that you review and send yourself, and
              BitNTech uses them only to reply to your enquiry.
            </p>
          </div>

          <div className="pd-card__ctas sbc-span">
            <button type="submit" className="pd-btn pd-btn--primary">Continue on WhatsApp</button>
            <button type="button" className="pd-btn pd-btn--secondary" onClick={() => send('email')}>Continue by email</button>
          </div>

          <div className="sbc-span" role="status" aria-live="polite">
            {Object.values(errors).some(Boolean) && (
              <p className="sbc-err">Please fix the highlighted fields.</p>
            )}
            {handoff && (
              <div className="sbc-handoff">
                <p>
                  <b>Not sent yet.</b>{' '}
                  {handoff.channel === 'whatsapp'
                    ? 'WhatsApp should have opened with your enquiry filled in. Press Send in WhatsApp to deliver it.'
                    : 'Your email app should have opened with your enquiry drafted. Press Send there to deliver it.'}
                </p>
                <p>
                  Nothing opened?{' '}
                  <a href={handoff.href} {...(handoff.channel === 'whatsapp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {handoff.channel === 'whatsapp' ? 'Open WhatsApp' : 'Open the email draft'}
                  </a>{' '}
                  or write to <a href={CONTACT.emailHref}>{CONTACT.email}</a>.
                </p>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="sbc-section">
        <p className="pd-label">FAQ</p>
        <h2>Frequently asked questions</h2>
        <div className="sbc-faq">
          {CARD_FAQ.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className="sbc-back"><Link to="/products">← All products</Link></p>
      </section>
    </div></main>
  )
}
