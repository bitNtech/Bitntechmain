/**
 * Every contact detail the site shows, in one place. Four separate files used
 * to carry their own copy of the phone number, the email and the social URLs,
 * which is how three of them ended up on placeholder values.
 */
export const CONTACT = {
  phone: '+91 78289 14263',
  /* Dial strings have no spaces — a `tel:` with them is silently mis-parsed by
     some Android dialers. */
  phoneHref: 'tel:+917828914263',
  email: 'support@bitntech.in',
  emailHref: 'mailto:support@bitntech.in',
  instagram: { handle: '@bitntech.in', url: 'https://www.instagram.com/bitntech.in/' },
  linkedin: { handle: 'BitNTech', url: 'https://linkedin.com/company/bitntech' },
  github: { handle: 'BitNTech', url: 'https://github.com/BitNTechadmin' },
  /* WhatsApp click-to-chat wants the number as bare digits with the country
     code. This is the same line as `phone` above — confirm it is registered on
     WhatsApp (Business) before shipping, or replace it here. */
  whatsapp: '917828914263',
} as const

/** Official click-to-chat link. Opens a chat with `text` prefilled; the person still has to press Send. */
export const whatsappHref = (text: string) =>
  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`

export const mailtoHref = (subject: string, body = '') =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

/* Product-specific openers for the WhatsApp CTAs. */
export const WA_MESSAGES = {
  aica: 'Hi BitNTech, I would like to request a demo of AICA (AI Caller Agent) for my business.',
  smartCard: 'Hi BitNTech, I am interested in a customized NFC Smart Business Card. Please share the options and a quotation.',
} as const
