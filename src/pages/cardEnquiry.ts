import { WA_MESSAGES } from '../contact.ts'

/* Validation and message building for the Smart Business Card enquiry. Kept
   out of the component so cardEnquiry.test.ts can run it under plain Node. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const CUSTOMIZATIONS = ['Personal', 'Business', 'Corporate'] as const

export type Values = {
  name: string
  company: string
  email: string
  phone: string
  quantity: string
  customization: string
  branding: string
  message: string
  consent: boolean
}
export type Field = keyof Values

export const EMPTY: Values = {
  name: '', company: '', email: '', phone: '', quantity: '',
  customization: '', branding: '', message: '', consent: false,
}

export function validate(v: Values): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  if (!v.name.trim()) e.name = 'Enter your full name.'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address, like name@company.com.'
  const digits = v.phone.replace(/[\s()+-]/g, '')
  if (!/^\d{8,15}$/.test(digits)) e.phone = 'Enter a phone number with country code, 8 to 15 digits.'
  const qty = Number(v.quantity)
  if (!Number.isInteger(qty) || qty < 1 || qty > 10000) e.quantity = 'Enter a quantity between 1 and 10,000.'
  if (!v.customization) e.customization = 'Choose Personal, Business or Corporate.'
  if (!v.consent) e.consent = 'Tick the box so we can reply to your enquiry.'
  return e
}

export function enquiryText(v: Values): string {
  const details = [
    `Name: ${v.name.trim()}`,
    v.company.trim() && `Company: ${v.company.trim()}`,
    `Email: ${v.email.trim()}`,
    `WhatsApp / phone: ${v.phone.trim()}`,
    `Quantity: ${v.quantity.trim()}`,
    `Customization: ${v.customization}`,
    v.branding.trim() && `Branding & design: ${v.branding.trim()}`,
    v.message.trim() && `Message: ${v.message.trim()}`,
  ]
  return [WA_MESSAGES.smartCard, '', ...details.filter(Boolean)].join('\n')
}
