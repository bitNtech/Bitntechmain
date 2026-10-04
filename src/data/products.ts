import { WA_MESSAGES, whatsappHref } from '../contact.ts'

/**
 * The product catalogue. Adding a product is adding a record here — the
 * /products grid, its structured data and the sitemap all read this list.
 * Pure data (no components), so scripts/seo-build.ts can import it too.
 */

export type ProductStatus = 'available' | 'customizable' | 'coming-soon'

export type ProductCta = { label: string; href: string; external?: boolean }

export type Product = {
  id: string
  name: string
  /** Short name used in alt text and headings where the full name is too long. */
  shortName: string
  category: string
  status: ProductStatus
  statusLabel: string
  summary: string
  features: string[]
  /** Which illustration the card draws — see ProductVisual in pages/Products.tsx. */
  visual: 'aica' | 'card' | 'vidya'
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
      'An AI-powered voice calling platform that automates business communication: it answers customer enquiries, supports appointment booking and routes callers to the right team.',
    features: [
      'Natural voice conversations',
      'Automated enquiry handling',
      'Appointment booking workflows',
      'Call routing and escalation',
    ],
    visual: 'aica',
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
    visual: 'vidya',
  },
]
