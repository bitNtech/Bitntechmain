import { WA_MESSAGES, whatsappHref } from '../contact.ts'

/**
 * The product catalogue. Adding a product is adding a record here — the
 * /products grid, its structured data and the sitemap all read this list.
 * Pure data (no components), so scripts/seo-build.ts can import it too.
 */

export type ProductStatus = 'available' | 'customizable' | 'coming-soon'

export type ProductCta = { label: string; href: string; external?: boolean }

export type ProductVideo = {
  /** Under /public, so served as-is at this path. */
  src: string
  poster: string
  title: string
  /** Seconds. Shown on the play button and in the VideoObject data. */
  duration: number
  /** ISO date the film was published, for the VideoObject data. */
  uploaded: string
}

export type Product = {
  id: string
  name: string
  /** Short name used in alt text and headings where the full name is too long. */
  shortName: string
  category: string
  status: ProductStatus
  statusLabel: string
  summary: string
  /** A short line from the product's own marketing, shown when featured. */
  tagline?: string
  features: string[]
  /** Short facts for the "at a glance" slide. Only what the product's own copy says. */
  highlights?: { label: string; value: string }[]
  /** The giant word its stage is set behind on /products. */
  bigWord: string
  /** A mark set after the word, as its last "letter". */
  bigGlyph?: 'nfc'
  /** What Nila says about it, instead of reading the panel out loud. */
  nila?: string
  /** Which illustration the card draws — see ProductVisual in pages/Products.tsx. */
  visual: 'aica' | 'card' | 'vidya'
  /** The flagship gets its own section above the grid. One at most. */
  featured?: boolean
  video?: ProductVideo
  detailUrl?: string
  primary?: ProductCta
  secondary?: ProductCta
}

export const PRODUCTS: Product[] = [
  {
    id: 'aica',
    name: 'AICA — AI Caller Agent',
    shortName: 'AICA',
    category: 'AI Voice Automation',
    status: 'available',
    statusLabel: 'Available for enquiries',
    summary:
      'An AI voice agent for business calls. AICA picks up, understands what the caller needs, answers enquiries, books appointments on the call and hands complex calls to your team.',
    // From the AICA launch film.
    tagline: 'Answer. Understand. Resolve. 24/7.',
    features: [
      'Business calls in Tamil, English and Tanglish',
      'Answers enquiries like timings and report status',
      'Books appointments on the call',
      'Hands complex calls over to your team',
    ],
    highlights: [
      { label: 'Languages', value: 'Tamil · English · Tanglish' },
      { label: 'Availability', value: '24/7' },
      { label: 'Hand-off', value: 'Complex calls go to your team' },
    ],
    bigWord: 'AICA',
    nila: "That's AICA, our flagship. Press 'See what AICA can do' — I'll step aside for the film.",
    visual: 'aica',
    featured: true,
    video: {
      src: '/assets/aica-ad.mp4',
      poster: '/assets/aica-poster.jpg',
      title: 'Meet AICA — the AI voice agent from BitNTech',
      duration: 43,
      uploaded: '2026-10-04',
    },
    detailUrl: 'https://aica.bitntech.in/',
    primary: { label: 'Explore AICA', href: 'https://aica.bitntech.in/', external: true },
    secondary: { label: 'Request a Demo', href: whatsappHref(WA_MESSAGES.aica), external: true },
  },
  {
    id: 'smart-business-card',
    name: 'Smart Business Card',
    shortName: 'Smart Business Card',
    category: 'NFC-Enabled Digital Business Identity',
    status: 'customizable',
    statusLabel: 'Customizable · Contact for quotation',
    summary:
      'A personalized NFC business card, designed around your brand and linked to a digital profile — so one tap on a compatible phone can open your contact details.',
    features: [
      'NFC contact sharing',
      'Custom card design and branding',
      'Personalized digital profile',
      'For individuals and teams',
    ],
    highlights: [
      { label: 'Share', value: 'One tap on a compatible phone' },
      { label: 'Design', value: 'Made to your brand' },
      { label: 'Order', value: 'Quoted per quantity — no checkout' },
    ],
    bigWord: 'NFC',
    bigGlyph: 'nfc',
    nila: 'The Smart Business Card. Tap it on a phone and your profile opens. Mostly. Phones vary.',
    visual: 'card',
    detailUrl: '/products/smart-business-card',
    primary: { label: 'Customize Your Card', href: '/products/smart-business-card#enquire' },
    secondary: { label: 'Enquire Now', href: '/products/smart-business-card#enquire' },
  },
  {
    id: 'vidya',
    name: 'VIDYA',
    shortName: 'VIDYA',
    category: 'Upcoming product',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    summary: 'A new product from BitNTech. More details coming soon.',
    features: [],
    bigWord: 'VIDYA',
    nila: "VIDYA. I'm not allowed to say anything yet. I've tried.",
    visual: 'vidya',
  },
]
